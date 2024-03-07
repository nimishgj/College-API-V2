const geoip = require("geoip-lite");

const getCurrentContextData = (req) => {
  const ip =
    req.ip || (req.connection && req.connection.remoteAddress) || "unknown";
  const location = geoip.lookup(ip);
  const country = location ? location.country || "unknown" : "unknown";
  const city = location ? location.city || "unknown" : "unknown";

  // Check if req.useragent exists before accessing its properties
  const browser =
    req.useragent && req.useragent.browser
      ? `${req.useragent.browser} ${req.useragent.version}`
      : "unknown";
  const platform =
    req.useragent && req.useragent.platform
      ? req.useragent.platform.toString()
      : "unknown";
  const os =
    req.useragent && req.useragent.os ? req.useragent.os.toString() : "unknown";
  const device =
    req.useragent && req.useragent.device
      ? req.useragent.device.toString()
      : "unknown";

  const isMobile = (req.useragent && req.useragent.isMobile) || false;
  const isDesktop = (req.useragent && req.useragent.isDesktop) || false;
  const isTablet = (req.useragent && req.useragent.isTablet) || false;

  const deviceType = isMobile
    ? "Mobile"
    : isDesktop
    ? "Desktop"
    : isTablet
    ? "Tablet"
    : "unknown";

  return { ip, country, city, browser, platform, os, device, deviceType };
};

module.exports = getCurrentContextData;
