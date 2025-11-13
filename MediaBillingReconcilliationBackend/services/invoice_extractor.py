"""
Invoice Extraction Service
Integrates production notebook invoice extraction with Flask API
"""

import os
import json
import pandas as pd
from pathlib import Path
from dotenv import load_dotenv
from typing import Dict, Any

# File reading libraries
import pdfplumber

# CrewAI imports
from crewai import Agent, Task, Crew, Process, LLM

# Load environment
load_dotenv()

# ============================================
# CANONICAL INVOICE SCHEMA
# ============================================

CANONICAL_SCHEMA_DOC = """
You MUST output a JSON object matching this EXACT structure:

{
  "invoice_header": {
    "invoice_number": string or null,
    "vendor_name": string or null,
    "campaign_name": string or null,
    "invoice_date": string or null,
    "billing_start_date": string or null,
    "billing_end_date": string or null,
    "currency": string or null,
    "total_impressions": number or null,
    "total_views": number or null,
    "total_clicks": number or null,
    "gross_revenue": number or null,
    "net_revenue": number or null,
    "total_discount_amount": number or null,
    "discount_percent": number or null,
    "profit": number or null
  },
  "line_items": [
    {
      "line_id": integer,
      "campaign_name": string or null,
      "placement": string or null,
      "start_date": string or null,
      "end_date": string or null,
      "planned_impressions": number or null,
      "billed_impressions": number or null,
      "views": number or null,
      "clicks": number or null,
      "gross_revenue": number or null,
      "net_revenue": number or null,
      "discount_amount": number or null,
      "discount_percent": number or null,
      "profit": number or null,
      "rate_type": string or null,
      "rate": number or null
    }
  ],
  "notes": string or null
}

EXTRACTION RULES:
1. Use null for missing values - DO NOT INVENT DATA
2. Discounts: Extract explicit or calculate implicit (gross - net)
3. Profit: Use stated value or calculate (revenue - cost) if available
4. Metrics: Map views/impressions/clicks to closest available field
5. Dates: Convert to YYYY-MM-DD format when possible
6. Line Items: Each table row becomes one line_item with sequential line_id
7. Aggregation: Sum line_items for header totals when not explicit
8. Currency: Extract currency code (USD, EUR, GBP, etc.)
"""

# ============================================
# INITIALIZE LLM
# ============================================

llm = LLM(
    model="gpt-4o",
    api_key=os.getenv("OPENAI_API_KEY"),
    temperature=0.1
)

# ============================================
# FILE READING FUNCTIONS
# ============================================

def read_pdf_content(pdf_path: str, max_pages: int = 5) -> str:
    """Extract text from PDF files."""
    try:
        pages_text = []
        with pdfplumber.open(pdf_path) as pdf:
            for i, page in enumerate(pdf.pages):
                if i >= max_pages:
                    break
                text = page.extract_text() or ""
                if text:
                    pages_text.append(f"--- Page {i+1} ---\n{text}")
        return "\n\n".join(pages_text)
    except Exception as e:
        return f"Error reading PDF: {str(e)}"


def read_excel_content(excel_path: str, sheet_name=None, max_rows=50) -> Dict[str, Any]:
    """Read Excel file and return structured preview."""
    try:
        excel_file = pd.ExcelFile(excel_path)
        
        if sheet_name is not None:
            sheets = [sheet_name]
        else:
            sheets = [excel_file.sheet_names[0]]
        
        result = {
            "file_name": Path(excel_path).name,
            "total_sheets": len(excel_file.sheet_names),
            "sheet_names": excel_file.sheet_names,
            "data": {}
        }
        
        for sheet in sheets:
            df = pd.read_excel(excel_path, sheet_name=sheet)
            df.columns = [str(c).strip().lower().replace(" ", "_").replace("-", "_") for c in df.columns]
            preview_df = df.head(max_rows)
            
            result["data"][sheet] = {
                "total_rows": len(df),
                "columns": list(df.columns),
                "preview": preview_df.to_dict(orient="records"),
                "preview_text": preview_df.to_string(index=False, max_colwidth=30)
            }
        
        return result
    except Exception as e:
        return {"error": str(e)}


def read_csv_content(csv_path: str, max_rows=50) -> Dict[str, Any]:
    """Read CSV file and return structured preview."""
    try:
        df = pd.read_csv(csv_path)
        df.columns = [str(c).strip().lower().replace(" ", "_").replace("-", "_") for c in df.columns]
        preview_df = df.head(max_rows)
        
        return {
            "file_name": Path(csv_path).name,
            "total_rows": len(df),
            "columns": list(df.columns),
            "preview": preview_df.to_dict(orient="records"),
            "preview_text": preview_df.to_string(index=False, max_colwidth=30)
        }
    except Exception as e:
        return {"error": str(e)}


def build_invoice_context(file_path: str, max_rows: int = 50) -> str:
    """Build formatted context from any invoice file type."""
    file_path_obj = Path(file_path)
    
    if not file_path_obj.exists():
        return f"ERROR: File not found: {file_path}"
    
    suffix = file_path_obj.suffix.lower()
    output = [f"FILE: {file_path_obj.name}", "=" * 70]
    
    if suffix == '.pdf':
        output.append("TYPE: PDF Invoice\n\nCONTENT:")
        output.append(read_pdf_content(str(file_path)))
    elif suffix in ['.xlsx', '.xls']:
        output.append("TYPE: Excel Spreadsheet")
        data = read_excel_content(str(file_path), max_rows=max_rows)
        if "error" in data:
            output.append(f"\nERROR: {data['error']}")
        else:
            output.append(f"\nSheets: {', '.join(data['sheet_names'])}")
            for sheet_name, sheet_data in data['data'].items():
                output.append(f"\n--- Sheet: {sheet_name} ---")
                output.append(f"Total Rows: {sheet_data['total_rows']}")
                output.append(f"Columns: {', '.join(sheet_data['columns'])}")
                output.append(f"\nData Preview (first {max_rows} rows):")
                output.append(sheet_data['preview_text'])
    elif suffix == '.csv':
        output.append("TYPE: CSV File")
        data = read_csv_content(str(file_path), max_rows=max_rows)
        if "error" in data:
            output.append(f"\nERROR: {data['error']}")
        else:
            output.append(f"\nTotal Rows: {data['total_rows']}")
            output.append(f"Columns: {', '.join(data['columns'])}")
            output.append(f"\nData Preview (first {max_rows} rows):")
            output.append(data['preview_text'])
    else:
        output.append(f"ERROR: Unsupported file type: {suffix}")
    
    return "\n".join(output)


# ============================================
# AGENT & TASK
# ============================================

invoice_extraction_agent = Agent(
    role='Media Invoice Data Extraction Specialist',
    goal='Extract structured financial and delivery data from media invoices into canonical JSON format',
    backstory="""You are an expert in media billing and invoice processing. 
    You understand advertising metrics (impressions, views, clicks), financial terms 
    (revenue, costs, discounts, profit), and how to extract data accurately from 
    various invoice formats. You always follow the canonical schema strictly and 
    never invent data - you use null for missing values.""",
    llm=llm,
    tools=[],
    verbose=True,
    allow_delegation=False
)


def create_extraction_task(file_path: str, max_rows: int = 50) -> Task:
    """Create extraction task with invoice context and schema."""
    context_str = build_invoice_context(file_path, max_rows=max_rows)
    
    description = f"""
Extract structured invoice data from the provided file and map it to the canonical schema.

**CANONICAL SCHEMA:**
{CANONICAL_SCHEMA_DOC}

**INVOICE DATA:**
{context_str}

**INSTRUCTIONS:**
1. Identify invoice header information (vendor, dates, totals, currency)
2. Extract all line items with sequential line_id starting from 1
3. Map financial metrics (revenue, costs, discounts, profit)
4. Map delivery metrics (impressions, views, clicks)
5. Calculate implicit discounts if gross and net revenue differ
6. Use null for missing values - DO NOT INVENT DATA
7. Add clarifications to 'notes' field if needed
8. Return ONLY valid JSON - no markdown, no explanations

**OUTPUT REQUIREMENT:**
Return a single valid JSON object following the canonical schema exactly.
""".strip()
    
    return Task(
        description=description,
        agent=invoice_extraction_agent,
        expected_output="Valid JSON object with invoice_header, line_items array, and notes field"
    )


# ============================================
# MAIN EXTRACTION FUNCTION
# ============================================

def extract_invoice_data(file_path: str, max_rows: int = 50) -> Dict[str, Any]:
    """
    Extract structured invoice data from any supported file format.
    
    Args:
        file_path: Path to invoice file
        max_rows: Maximum rows to process from tabular files
    
    Returns:
        Dictionary with extracted invoice data in canonical format
    """
    print(f"📄 Extracting invoice data from: {Path(file_path).name}")
    
    # Create task
    task = create_extraction_task(file_path, max_rows=max_rows)
    
    # Create crew
    crew = Crew(
        agents=[invoice_extraction_agent],
        tasks=[task],
        process=Process.sequential,
        verbose=True
    )
    
    # Execute extraction
    result = crew.kickoff()
    result_str = str(result).strip()
    
    # Parse JSON from result
    try:
        parsed = json.loads(result_str)
    except json.JSONDecodeError:
        # Try to extract JSON from response
        start = result_str.find("{")
        end = result_str.rfind("}")
        
        if start != -1 and end != -1 and start < end:
            json_str = result_str[start : end + 1]
            try:
                parsed = json.loads(json_str)
            except json.JSONDecodeError as e:
                return {
                    "error": "Failed to parse JSON response",
                    "details": str(e),
                    "raw_response": result_str[:500]
                }
        else:
            return {
                "error": "No JSON object found in response",
                "raw_response": result_str[:500]
            }
    
    return parsed


# ============================================
# VALIDATION & EXPORT
# ============================================

def validate_extracted_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """Validate extracted data against canonical schema."""
    validation = {
        "valid": True,
        "errors": [],
        "warnings": []
    }
    
    if "invoice_header" not in data:
        validation["valid"] = False
        validation["errors"].append("Missing 'invoice_header' field")
    
    if "line_items" not in data:
        validation["valid"] = False
        validation["errors"].append("Missing 'line_items' field")
    elif not isinstance(data["line_items"], list):
        validation["valid"] = False
        validation["errors"].append("'line_items' must be an array")
    
    if "invoice_header" in data:
        header = data["invoice_header"]
        if not header.get("invoice_number") and not header.get("vendor_name"):
            validation["warnings"].append("Missing both invoice_number and vendor_name")
    
    return validation


def save_to_json(data: Dict[str, Any], output_path: str = None) -> str:
    """Save extracted data to JSON file."""
    if output_path is None:
        timestamp = pd.Timestamp.now().strftime("%Y%m%d_%H%M%S")
        output_path = f"extracted_invoice_{timestamp}.json"
    
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    return output_path
