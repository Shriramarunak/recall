import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="foot">
      <div className="shell foot__inner">
        <div className="foot__brand">
          <Logo tone="accent" />
          <span className="foot__wordmark">Recall</span>
        </div>
        <p className="foot__note">Progress is saved in this browser only.</p>
      </div>
    </footer>
  );
}
