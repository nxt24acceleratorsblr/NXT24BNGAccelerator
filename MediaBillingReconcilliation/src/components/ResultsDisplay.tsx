import './ResultsDisplay.css';
import type { CampaignResult } from '../types';

interface ResultsDisplayProps {
  result: CampaignResult;
  productName: string;
}

const ResultsDisplay = ({ result, productName }: ResultsDisplayProps) => {
  return (
    <div className="results-display">
      <div className="results-header">
        <h2>🎉 Complete Marketing Campaign Generated!</h2>
        <p>Your comprehensive {productName} marketing strategy is ready</p>
      </div>

      {/* Market Research Section */}
      {result.marketResearch && (
        <div className="result-section">
          <h3 className="section-title">📊 Market Research</h3>
          <div className="section-content">
            <div className="subsection">
              <h4>Top Features</h4>
              <ul>
                {result.marketResearch.features.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
            </div>
            <div className="subsection">
              <h4>Competitive Analysis</h4>
              <p>{result.marketResearch.competitors}</p>
            </div>
            <div className="subsection">
              <h4>Target Audience</h4>
              <p>{result.marketResearch.targetAudience}</p>
            </div>
          </div>
        </div>
      )}

      {/* Content Strategy Section */}
      {result.contentStrategy && (
        <div className="result-section highlight">
          <h3 className="section-title">✨ Content Strategy</h3>
          <div className="section-content">
            <div className="tagline-box">
              <span className="tagline-label">Campaign Tagline</span>
              <h2 className="tagline">{result.contentStrategy.tagline}</h2>
            </div>
            <div className="subsection">
              <h4>Product Description</h4>
              <p className="description">{result.contentStrategy.description}</p>
            </div>
            <div className="subsection">
              <h4>Unique Selling Points</h4>
              <ul className="usps">
                {result.contentStrategy.usps.map((usp, idx) => (
                  <li key={idx}>{usp}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Social Media Section */}
      {result.socialMedia && (
        <div className="result-section">
          <h3 className="section-title">📱 Social Media Campaign</h3>
          <div className="section-content">
            <div className="subsection">
              <h4>Instagram Posts</h4>
              {result.socialMedia.instagramPosts.map((post, idx) => (
                <div key={idx} className="social-post instagram">
                  <span className="post-label">Post {idx + 1}</span>
                  <p>{post}</p>
                </div>
              ))}
            </div>
            <div className="subsection">
              <h4>Twitter Thread</h4>
              <div className="social-post twitter">
                <pre>{result.socialMedia.twitterThread}</pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Campaign Section */}
      {result.emailCampaign && (
        <div className="result-section">
          <h3 className="section-title">📧 Email Campaign</h3>
          <div className="section-content">
            <div className="email-subject">
              <span className="email-label">Subject Line</span>
              <h4>{result.emailCampaign.subjectLine}</h4>
            </div>
            <div className="email-versions">
              <div className="email-version">
                <h4>Version A - Existing Customers</h4>
                <div className="email-body">{result.emailCampaign.versionA}</div>
              </div>
              <div className="email-version">
                <h4>Version B - New Customers</h4>
                <div className="email-body">{result.emailCampaign.versionB}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="results-footer">
        <button className="download-button" onClick={() => {
          const dataStr = JSON.stringify(result, null, 2);
          const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
          const exportFileDefaultName = `${productName.replace(/\s+/g, '_')}_campaign.json`;
          const linkElement = document.createElement('a');
          linkElement.setAttribute('href', dataUri);
          linkElement.setAttribute('download', exportFileDefaultName);
          linkElement.click();
        }}>
          📥 Download Campaign as JSON
        </button>
      </div>
    </div>
  );
};

export default ResultsDisplay;
