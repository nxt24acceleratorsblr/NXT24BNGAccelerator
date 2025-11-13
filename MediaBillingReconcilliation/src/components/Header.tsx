import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <span className="logo-icon">📊</span>
          <h1>Billing Reconcilliation</h1>
        </div>
        <p className="tagline">Automated Invoice Processing & Validation</p>
      </div>
    </header>
  );
};

export default Header;
