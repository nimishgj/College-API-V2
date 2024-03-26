const geoip = require("geoip-lite");

const getCurrentContextData = (request) => {
  const ip =
    request.ip || (request.connection && request.connection.remoteAddress) || "unknown";
  const location = geoip.lookup(ip);
  const country = location ? location.country || "unknown" : "unknown";
  const city = location ? location.city || "unknown" : "unknown";

  // Check if request.useragent exists before accessing its properties
  const browser =
    request.useragent && request.useragent.browser
      ? `${request.useragent.browser} ${request.useragent.version}`
      : "unknown";
  const platform =
    request.useragent && request.useragent.platform
      ? request.useragent.platform.toString()
      : "unknown";
  const os =
    request.useragent && request.useragent.os ? request.useragent.os.toString() : "unknown";
  const device =
    request.useragent && request.useragent.device
      ? request.useragent.device.toString()
      : "unknown";

  const isMobile = (request.useragent && request.useragent.isMobile) || false;
  const isDesktop = (request.useragent && request.useragent.isDesktop) || false;
  const isTablet = (request.useragent && request.useragent.isTablet) || false;

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
