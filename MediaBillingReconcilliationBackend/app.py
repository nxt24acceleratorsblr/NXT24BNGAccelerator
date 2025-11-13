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

# Legacy endpoint for backward compatibility
@app.route('/api/upload-pdf', methods=['POST'])
def upload_pdf():
    """Legacy PDF upload endpoint - redirects to universal upload"""
    return upload_file()

@app.route('/api/generate-campaign', methods=['POST'])
def generate_campaign():
    """
    Generate marketing campaign using CrewAI agents
    Accepts: product_name, pdf_content (optional)
    Returns: Campaign results from all 4 agents
    """
    try:
        data = request.json
        product_name = data.get('product_name', 'iPhone 17')
        pdf_content = data.get('pdf_content', '')
        
        # Import notebook functions
        from services.campaign_notebook import run_campaign
        
        # Run campaign
        results = run_campaign(product_name, pdf_content)
        
        return jsonify({
            'success': True,
            'results': results
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/generate-research', methods=['POST'])
def generate_research():
    """
    Generate market research only
    Accepts: product_name, pdf_content (optional)
    """
    try:
        data = request.json
        product_name = data.get('product_name', 'iPhone 17')
        pdf_content = data.get('pdf_content', '')
        
        from services.campaign_notebook import run_research_task
        
        result = run_research_task(product_name, pdf_content)
        
        return jsonify({
            'success': True,
            'research': result
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("🚀 Starting iPhone 17 Campaign Generator API...")
    print(f"📁 Upload folder: {UPLOAD_FOLDER}")
    print("📄 Supported file types: PDF, CSV, XML, Images (JPG, PNG, GIF, BMP)")
    print("🌐 Server running on http://localhost:5000")
    app.run(debug=True, port=5000)
