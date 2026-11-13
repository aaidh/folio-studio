# Browser export dependencies

These browser bundles are checked in so image and PDF downloads work without a CDN or server.

- html2canvas **1.4.1**, MIT: https://github.com/niklasvh/html2canvas
- jsPDF **4.2.1**, MIT: https://github.com/parallax/jsPDF

Each package's license is included alongside its bundle. To reproduce these files, run `npm ci` then `npm run vendor`. No package installation or build is needed to serve the existing repository.
