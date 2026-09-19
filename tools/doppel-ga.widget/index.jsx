// Übersicht widget: Doppel + Pod Factory live stats from Cloudflare Web Analytics.
// Drop (or symlink) this folder into ~/Library/Application Support/Übersicht/widgets/
// Setup steps + config.json schema: see fetch_stats.py header.

export const command = "cd \"$HOME/Library/Application Support/Übersicht/widgets/doppel-ga.widget\" && /usr/bin/python3 fetch_stats.py 2>&1";

export const refreshFrequency = 30000; // 30s

export const className = `
  top: 28px;
  right: 28px;
  font-family: 'SF Mono', 'Menlo', monospace;
  color: #F4EFE6;
  background: rgba(14, 14, 14, 0.82);
  -webkit-backdrop-filter: blur(24px) saturate(140%);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 16px;
  padding: 20px 22px 18px;
  width: 240px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
  letter-spacing: 0.01em;

  .title {
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.22em;
    opacity: 0.55;
    margin-bottom: 14px;
    display: flex;
    justify-content: space-between;
  }
  .title .src { opacity: 0.5; }
  .row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: 6px 0;
  }
  .row + .row { border-top: 1px solid rgba(255,255,255,0.06); }
  .label {
    font-size: 11px;
    opacity: 0.72;
    display: flex;
    align-items: center;
  }
  .value {
    font-size: 22px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }
  .pulse {
    width: 6px;
    height: 6px;
    background: #F38020;
    border-radius: 50%;
    display: inline-block;
    margin-right: 8px;
    box-shadow: 0 0 8px #F38020;
    animation: pulse 1.6s ease-in-out infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 0.35; transform: scale(0.85); }
    50%      { opacity: 1;    transform: scale(1.1);  }
  }
  .sites {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid rgba(255,255,255,0.06);
    font-size: 10px;
    opacity: 0.7;
  }
  .site-row {
    display: flex;
    justify-content: space-between;
    padding: 2px 0;
    font-variant-numeric: tabular-nums;
  }
  .err {
    color: #ff8a8a;
    font-size: 11px;
    line-height: 1.4;
  }
`;

const fmt = (n) => (n == null ? "—" : n.toLocaleString("es-CL"));

export const render = ({ output, error }) => {
  if (error) return <div className="err">err: {String(error).slice(0, 200)}</div>;
  let data;
  try {
    data = JSON.parse(output);
  } catch (_) {
    return <div className="err">raw: {output ? String(output).slice(0, 300) : "(sin output)"}</div>;
  }
  if (data.error) return <div className="err">{data.error}</div>;

  const sites = data.bySiteToday || {};
  const siteKeys = Object.keys(sites).sort((a, b) => sites[b] - sites[a]);

  return (
    <div>
      <div className="title">
        <span>Doppel · Pod Factory</span>
        <span className="src">CF</span>
      </div>

      <div className="row">
        <div className="label"><span className="pulse" />Activos (30m)</div>
        <div className="value">{fmt(data.active)}</div>
      </div>
      <div className="row">
        <div className="label">Pageviews hoy</div>
        <div className="value">{fmt(data.today)}</div>
      </div>

      {siteKeys.length > 0 && (
        <div className="sites">
          {siteKeys.map((host) => (
            <div className="site-row" key={host}>
              <span>{host}</span>
              <span>{fmt(sites[host])}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
