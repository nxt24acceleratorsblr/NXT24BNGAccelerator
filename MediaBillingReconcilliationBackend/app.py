"""
Flask API Server for iPhone 17 Campaign Generator
Bridges React UI with Jupyter Notebook CrewAI agents
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys
import tempfile
from pathlib import Path

app = Flask(__name__)
CORS(app)

# Directory to store uploaded files
UPLOAD_FOLDER = Path(__file__).parent / 'uploads'
UPLOAD_FOLDER.mkdir(exist_ok=True)

# Add paths for imports
sys.path.append(str(Path(__file__).parent))
sys.path.append(str(Path(__file__).parent / 'utils'))
sys.path.append(str(Path(__file__).parent / 'services'))

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'iPhone 17 Campaign Generator API'
    })

@app.route('/api/upload-file', methods=['POST'])
def upload_file():
    """
    Upload file from React UI (supports PDF, CSV, XML, Images)
    Returns: Parsed content and file metadata
    """
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Save file
        file_path = UPLOAD_FOLDER / file.filename
        file.save(file_path)
        
        # Parse file using universal parser
        from utils.file_parsers import parse_file, detect_file_type
        
        file_type = detect_file_type(str(file_path))
        parse_result = parse_file(str(file_path))
        
        if not parse_result.get('success', False):
            return jsonify({
                'error': parse_result.get('error', 'File parsing failed')
            }), 400
        
        return jsonify({
            'success': True,
            'file_type': file_type,
            'content': parse_result.get('raw_content', ''),
            'parsed_data': parse_result.get('parsed_data', {}),
            'metadata': parse_result.get('metadata', {}),
            'filepath': str(file_path),
            'filename': file.filename
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/extract-invoice', methods=['POST'])
def extract_invoice():
    """
    Extract structured invoice data using production notebook logic
    Accepts: file (multipart) OR filepath (JSON)
    Returns: Canonical invoice JSON with validation results
    """
    try:
        # Support both file upload and filepath
        if 'file' in request.files:
            file = request.files['file']
            
            if file.filename == '':
                return jsonify({'error': 'No file selected'}), 400
            
            # Save uploaded file
            file_path = UPLOAD_FOLDER / file.filename
            file.save(file_path)
            filepath = str(file_path)
            
            # Extract max_rows from form data when using multipart
            max_rows = int(request.form.get('max_rows', 50))
        
        elif request.is_json and request.json and 'filepath' in request.json:
            filepath = request.json['filepath']
            
            if not Path(filepath).exists():
                return jsonify({'error': f'File not found: {filepath}'}), 404
            
            # Extract max_rows from JSON when using filepath
            max_rows = request.json.get('max_rows', 50)
        
        else:
            return jsonify({'error': 'No file or filepath provided'}), 400
        
        # Import invoice extractor
        from services.invoice_extractor import extract_invoice_data, validate_extracted_data
        
        # Extract invoice data
        print(f"🔍 Extracting invoice from: {filepath}")
        invoice_data = extract_invoice_data(filepath, max_rows=max_rows)
        
        # Validate extracted data
        validation = validate_extracted_data(invoice_data)
        
        return jsonify({
            'success': True,
            'invoice_data': invoice_data,
            'validation': validation,
            'filepath': filepath
        })
    
    except Exception as e:
        import traceback
        return jsonify({
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500

@app.route('/api/reconcile-invoice', methods=['POST'])
def reconcile_invoice():
    """
    Run complete invoice reconciliation workflow - Phase 2
    Accepts: extracted_data (JSON) OR filepath (will extract first)
    Returns: Reconciliation results with discrepancy report
    """
    try:
        # Import reconciliation functions
        from services.invoice_reconciliation import run_invoice_reconciliation
        
        # Support both pre-extracted data and filepath
        if request.is_json and 'extracted_data' in request.json:
            # Use pre-extracted data
            extracted_data = request.json['extracted_data']
            mapping_folder = request.json.get('mapping_folder', '../MediaBillingNotebook/mapping')
            string_threshold = request.json.get('string_threshold', 0.8)
            number_tolerance = request.json.get('number_tolerance', 5.0)
            
            # Import reconciliation module functions
            from services.invoice_reconciliation import (
                load_mapping_files, normalize_mapping_data, 
                find_fuzzy_matches, generate_discrepancy_report, 
                save_discrepancy_report, calculate_trust_score
            )
            
            # Load and normalize mapping data
            mapping_data_raw = load_mapping_files(mapping_folder)
            if not mapping_data_raw:
                return jsonify({
                    'success': False,
                    'error': 'No mapping files found'
                }), 404
            
            mapping_data = [normalize_mapping_data(m) for m in mapping_data_raw]
            
            # Run fuzzy matching
            fuzzy_matches = find_fuzzy_matches(
                extracted_data,
                mapping_data,
                string_threshold,
                number_tolerance
            )
            
            # Calculate trust score
            trust_score = calculate_trust_score(fuzzy_matches)
            
            # Generate report
            discrepancy_df = generate_discrepancy_report(fuzzy_matches)
            report_path = None
            if not discrepancy_df.empty:
                report_path = save_discrepancy_report(discrepancy_df)
            
            return jsonify({
                'success': True,
                'status': 'success',
                'extracted_data': extracted_data,
                'mapping_files_count': len(mapping_data),
                'fuzzy_matches': fuzzy_matches,
                'discrepancy_report': discrepancy_df.to_dict('records') if not discrepancy_df.empty else [],
                'report_path': report_path,
                'trust_score': trust_score,
                'summary': {
                    'total_line_items': len(extracted_data.get('line_items', [])),
                    'fuzzy_matches': len(fuzzy_matches['fuzzy_matches']),
                    'discrepancies': len(fuzzy_matches['potential_discrepancies']),
                    'unmatched': len(fuzzy_matches['no_match_found'])
                }
            })
        
        elif request.is_json and 'filepath' in request.json:
            # Extract and reconcile
            filepath = request.json['filepath']
            if not Path(filepath).exists():
                return jsonify({'error': f'File not found: {filepath}'}), 404
            
            mapping_folder = request.json.get('mapping_folder', '../MediaBillingNotebook/mapping')
            string_threshold = request.json.get('string_threshold', 0.8)
            number_tolerance = request.json.get('number_tolerance', 5.0)
            
            results = run_invoice_reconciliation(
                filepath,
                mapping_folder,
                string_threshold,
                number_tolerance,
                save_report=True
            )
            
            return jsonify({
                'success': True,
                **results
            })
        
        else:
            return jsonify({'error': 'Either extracted_data or filepath required'}), 400
    
    except Exception as e:
        import traceback
        return jsonify({
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500

if __name__ == '__main__':
    print("🚀 Starting iPhone 17 Campaign Generator API...")
    print(f"📁 Upload folder: {UPLOAD_FOLDER}")
    print("📄 Supported file types: PDF, CSV, Excel (.xlsx, .xls), XML, Images (JPG, PNG, GIF, BMP)")
    print("🌐 Server running on http://localhost:5000")
    app.run(debug=True, port=5000)
