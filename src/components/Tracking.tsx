import Script from "next/script";
import { TRACKING } from "@/lib/site";

// GTM is the umbrella container — load it once in <head>. GA4, FB Pixel,
// and Clarity are typically loaded *inside GTM* in production. We still
// fall back to direct fragments here so the site has working tracking
// the moment any single ID is set in env, even before GTM is configured.
export function TrackingHead() {
  return (
    <>
      {TRACKING.gtmId && (
        <Script id="gtm-head" strategy="afterInteractive">{`
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${TRACKING.gtmId}');
        `}</Script>
      )}
      {TRACKING.ga4Id && !TRACKING.gtmId && (
        <>
          <Script
            id="ga4-loader"
            src={`https://www.googletagmanager.com/gtag/js?id=${TRACKING.ga4Id}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">{`
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${TRACKING.ga4Id}', { send_page_view: true });
          `}</Script>
        </>
      )}
      {TRACKING.fbPixelId && !TRACKING.gtmId && (
        <Script id="fb-pixel" strategy="afterInteractive">{`
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${TRACKING.fbPixelId}'); fbq('track', 'PageView');
        `}</Script>
      )}
      {TRACKING.clarityId && !TRACKING.gtmId && (
        <Script id="clarity" strategy="afterInteractive">{`
(function(c,l,a,r,i,t,y){
  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "${TRACKING.clarityId}");
        `}</Script>
      )}
    </>
  );
}

export function TrackingBody() {
  if (!TRACKING.gtmId) return null;
  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${TRACKING.gtmId}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
        title="GTM"
      />
    </noscript>
  );
}
