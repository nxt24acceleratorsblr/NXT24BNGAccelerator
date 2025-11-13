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

# Define Agents
market_researcher = Agent(
    role='Market Research Analyst',
    goal='Conduct comprehensive market research and competitive analysis for {product}',
    backstory="""You are an expert market research analyst with 15 years of experience 
    in the tech industry. You specialize in consumer electronics and have a deep understanding 
    of market trends, consumer behavior, and competitive landscapes.""",
    verbose=True,
    allow_delegation=False,
    llm=llm
)

content_strategist = Agent(
    role='Content Strategy Director',
    goal='Develop compelling content strategy and messaging for {product}',
    backstory="""You are a seasoned content strategist who has worked with top tech brands. 
    You excel at creating narratives that resonate with target audiences and drive engagement.""",
    verbose=True,
    allow_delegation=False,
    llm=llm
)

social_media_expert = Agent(
    role='Social Media Marketing Manager',
    goal='Create engaging social media campaigns for {product}',
    backstory="""You are a social media expert with proven track record of viral campaigns. 
    You understand platform dynamics, trending formats, and how to create shareable content.""",
    verbose=True,
    allow_delegation=False,
    llm=llm
)

email_marketer = Agent(
    role='Email Marketing Specialist',
    goal='Design high-converting email campaigns for {product}',
    backstory="""You are an email marketing specialist with expertise in segmentation, 
    personalization, and conversion optimization. You craft emails that drive action.""",
    verbose=True,
    allow_delegation=False,
    llm=llm
)

def create_research_task(product_name: str, pdf_context: str = ""):
    """Create market research task with optional PDF context"""
    context_section = f"\n\nPRODUCT INFORMATION FROM FILE:\n{pdf_context}\n" if pdf_context else ""
    
    return Task(
        description=f"""Conduct comprehensive market research for {product_name}.
        {context_section}
        
        Your analysis should include:
        1. Market size and growth projections
        2. Target audience demographics and psychographics
        3. Key competitors and their market positioning
        4. Market trends and opportunities
        5. SWOT analysis
        6. Pricing strategy recommendations
        
        Provide data-driven insights and actionable recommendations.""",
        expected_output="""A detailed market research report with:
        - Executive summary
        - Market analysis with statistics
        - Competitive landscape
        - Target audience personas
        - Strategic recommendations""",
        agent=market_researcher
    )

def create_content_task():
    """Create content strategy task"""
    return Task(
        description="""Based on the market research, develop a comprehensive content strategy.
        
        Create:
        1. Brand messaging framework
        2. Key value propositions
        3. Content pillars and themes
        4. Storytelling approach
        5. Content calendar outline
        
        Ensure messaging resonates with target audience and differentiates from competitors.""",
        expected_output="""A content strategy document including:
        - Brand positioning statement
        - Core messaging framework
        - Content themes and pillars
        - Tone and voice guidelines
        - Content distribution plan""",
        agent=content_strategist
    )

def create_social_task():
    """Create social media campaign task"""
    return Task(
        description="""Create a multi-platform social media campaign.
        
        Develop:
        1. Platform-specific content strategies (Instagram, Twitter, TikTok, LinkedIn)
        2. Creative concepts and campaign themes
        3. Content formats (Reels, Stories, Posts, Videos)
        4. Hashtag strategy
        5. Influencer collaboration ideas
        6. Engagement tactics
        
        Focus on viral potential and community building.""",
        expected_output="""A social media campaign plan with:
        - Platform strategies for each channel
        - 10+ creative post concepts
        - Campaign hashtags
        - Content calendar
        - KPIs and success metrics""",
        agent=social_media_expert
    )

def create_email_task():
    """Create email marketing campaign task"""
    return Task(
        description="""Design a comprehensive email marketing campaign.
        
        Include:
        1. Email sequence (pre-launch, launch, post-launch)
        2. Subject line variations
        3. Email copy and CTAs
        4. Segmentation strategy
        5. Personalization elements
        6. A/B testing plan
        
        Optimize for open rates, click-through rates, and conversions.""",
        expected_output="""An email campaign package with:
        - Email sequence overview
        - 5+ email templates with copy
        - Subject line options
        - Segmentation strategy
        - Performance tracking plan""",
        agent=email_marketer
    )

def run_research_task(product_name: str = "iPhone 17", pdf_content: str = ""):
    """Run only the market research task"""
    research_task = create_research_task(product_name, pdf_content)
    
    crew = Crew(
        agents=[market_researcher],
        tasks=[research_task],
        verbose=True
    )
    
    result = crew.kickoff()
    return result.raw if hasattr(result, 'raw') else str(result)

def run_campaign(product_name: str = "iPhone 17", pdf_content: str = ""):
    """Run complete marketing campaign with all 4 agents"""
    
    # Create tasks
    research_task = create_research_task(product_name, pdf_content)
    content_task = create_content_task()
    social_task = create_social_task()
    email_task = create_email_task()
    
    # Create crew
    crew = Crew(
        agents=[market_researcher, content_strategist, social_media_expert, email_marketer],
        tasks=[research_task, content_task, social_task, email_task],
        verbose=True
    )
    
    # Execute
    result = crew.kickoff()
    
    # Extract results
    return {
        'market_research': research_task.output.raw if hasattr(research_task, 'output') else str(research_task),
        'content_strategy': content_task.output.raw if hasattr(content_task, 'output') else str(content_task),
        'social_media': social_task.output.raw if hasattr(social_task, 'output') else str(social_task),
        'email_campaign': email_task.output.raw if hasattr(email_task, 'output') else str(email_task),
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
