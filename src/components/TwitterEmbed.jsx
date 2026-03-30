import React, { useEffect } from 'react';
import './TwitterEmbed.css';

const TwitterEmbed = () => {
  useEffect(() => {
    // Load Twitter script dynamically if not present
    if (!window.twttr) {
      const script = document.createElement("script");
      script.setAttribute("src", "https://platform.twitter.com/widgets.js");
      script.setAttribute("async", "true");
      script.setAttribute("charset", "utf-8");
      document.body.appendChild(script);
    } else {
      window.twttr.widgets.load();
    }
  }, []);

  return (
    <div className="twitter-embed">
      <a className="twitter-timeline" href="https://twitter.com/Ho_nan2000?ref_src=twsrc%5Etfw">Tweets by Ho_nan2000</a>
    </div>
  );
};

export default TwitterEmbed;
