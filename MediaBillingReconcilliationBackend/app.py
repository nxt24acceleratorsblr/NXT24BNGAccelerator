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

if __name__ == '__main__':
    print("🚀 Starting iPhone 17 Campaign Generator API...")
    print(f"📁 Upload folder: {UPLOAD_FOLDER}")
    print("📄 Supported file types: PDF, CSV, Excel (.xlsx, .xls), XML, Images (JPG, PNG, GIF, BMP)")
    print("🌐 Server running on http://localhost:5000")
    app.run(debug=True, port=5000)
