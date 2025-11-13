"""
Campaign Notebook Functions
Exports CrewAI campaign generation functions for API integration
"""

import os
from dotenv import load_dotenv
from crewai import Agent, Task, Crew
from langchain_openai import ChatOpenAI
import pdfplumber

# Load environment variables
load_dotenv()

# Initialize LLM
llm = ChatOpenAI(
    model="gpt-4o",
    temperature=0.7,
    api_key=os.getenv('OPENAI_API_KEY')
)

def read_pdf_content(pdf_path: str) -> str:
    """Read and extract text from a PDF file"""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            text = ""
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
            return text.strip()
    except Exception as e:
        # Fallback for text files
        try:
            with open(pdf_path, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as fallback_error:
            return f"Error reading file: {str(e)}, Fallback error: {str(fallback_error)}"

def extract_product_info_from_pdf(pdf_content: str) -> dict:
    """Extract structured product information from PDF content"""
    info = {
        'product_name': '',
        'features': [],
        'target_market': '',
        'price': ''
    }
    
    lines = pdf_content.split('\n')
    for line in lines:
        line = line.strip()
        if line.startswith('Product Name:'):
            info['product_name'] = line.replace('Product Name:', '').strip()
        elif line.startswith('Features:'):
            info['features'] = [f.strip() for f in line.replace('Features:', '').split(',')]
        elif line.startswith('Target Market:'):
            info['target_market'] = line.replace('Target Market:', '').strip()
        elif line.startswith('Price:'):
            info['price'] = line.replace('Price:', '').strip()
    
    return info

def run_campaign(product_name: str = "iPhone 17", pdf_content: str = ""):
    """Run complete marketing campaign with all 4 agents"""
    # Extract product info from PDF content if provided
    product_info = extract_product_info_from_pdf(pdf_content) if pdf_content else {}
    product_name = product_info.get('product_name', product_name)
    target_market = product_info.get('target_market', 'Tech enthusiasts and professionals')
    # Define tasks
    tasks = [
        Task(
            name="Market Research",
            prompt=f"Conduct market research for the product '{product_name}' targeting '{target_market}'. Identify key competitors, market trends, and potential customer segments.",
            llm=llm
        ),
    ]
    
    # Create crew
    crew = Crew(
        tasks=tasks,
        verbose=True
    )
    
    # Execute
    result = crew.kickoff()
    
    # Extract results
    return {
         'full_output': result.raw if hasattr(result, 'raw') else str(result)
    }

if __name__ == "__main__":
    # Test with PDF
    pdf_path = "data.pdf"
    if os.path.exists(pdf_path):
        pdf_content = read_pdf_content(pdf_path)
        print("PDF Content:", pdf_content)
        print("\n" + "="*50 + "\n")
        
        result = run_campaign("iPhone 17", pdf_content)
        print(result)
    else:
        print(f"PDF file not found: {pdf_path}")
