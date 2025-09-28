# IC4G Product Catalog - GitHub Pages Static Version

This is a static version of the IC4G Product Catalog that can be hosted directly on GitHub Pages without any backend server.

## Features

- **Full client-side search and filtering** - All operations run in the browser
- **No backend required** - Works entirely with static files
- **Fast performance** - Data is loaded once and cached in memory
- **Responsive design** - Works on desktop and mobile devices
- **Pagination** - Handle large datasets efficiently
- **Product details** - Click any product to view full information

## Deployment to GitHub Pages

### Option 1: Deploy to Your Main GitHub Pages Site

1. **Create a new repository** named `[your-username].github.io` if you don't have one already

2. **Upload the files** to the repository:
   ```bash
   git clone https://github.com/[your-username]/[your-username].github.io
   cd [your-username].github.io

   # Copy all files from github-pages-version folder
   cp /path/to/ic4g-catalog/github-pages-version/* .

   git add .
   git commit -m "Add IC4G Product Catalog"
   git push
   ```

3. **Access your catalog** at: `https://[your-username].github.io`

### Option 2: Deploy as a Project Page

1. **Create a new repository** for the catalog (e.g., `ic4g-catalog`)

2. **Upload the files** to the repository:
   ```bash
   git clone https://github.com/[your-username]/ic4g-catalog
   cd ic4g-catalog

   # Copy all files from github-pages-version folder
   cp /path/to/ic4g-catalog/github-pages-version/* .

   git add .
   git commit -m "Initial commit - IC4G Product Catalog"
   git push
   ```

3. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Click on Settings → Pages
   - Under "Source", select "Deploy from a branch"
   - Select "main" branch and "/ (root)" folder
   - Click Save

4. **Access your catalog** at: `https://[your-username].github.io/ic4g-catalog`

### Option 3: Deploy to a Subdirectory

If you already have a GitHub Pages site and want to add this as a subdirectory:

1. **Create a folder** in your existing GitHub Pages repository:
   ```bash
   cd [your-github-pages-repo]
   mkdir ic4g-catalog

   # Copy all files
   cp /path/to/ic4g-catalog/github-pages-version/* ic4g-catalog/

   git add .
   git commit -m "Add IC4G Product Catalog"
   git push
   ```

2. **Access your catalog** at: `https://[your-username].github.io/ic4g-catalog/`

## Files Included

- `index.html` - Main HTML page
- `app.js` - JavaScript application logic
- `style.css` - Custom styles
- `unified_catalog_data.json` - Product catalog data (11,259 products)

## Local Testing

To test the static version locally before deploying:

1. **Using Python** (if you have Python installed):
   ```bash
   cd github-pages-version
   python3 -m http.server 8000
   ```
   Then open: http://localhost:8000

2. **Using Node.js** (if you have Node.js installed):
   ```bash
   cd github-pages-version
   npx http-server -p 8000
   ```
   Then open: http://localhost:8000

3. **Direct file access**: Simply open `index.html` in your browser (though some features may be limited due to CORS restrictions)

## Updating the Data

To update the product catalog data:

1. Generate a new `unified_catalog_data.json` file from your sources
2. Replace the existing file in your GitHub repository
3. Commit and push the changes
4. The catalog will automatically use the updated data

## Customization

You can customize the catalog by modifying:

- `style.css` - Change colors, fonts, and layout
- `app.js` - Modify search logic, add new filters, or change display format
- `index.html` - Update the UI structure or add new sections

## Data Format

The `unified_catalog_data.json` file contains an array of product objects with these fields:

```json
{
  "Product_Package": "Package name",
  "Product_Package_ID": "Package ID",
  "Product_Description": "Product description",
  "Product_ID": "Unique product ID",
  "Product_Capacity": "Capacity value",
  "Product_Unit_of_Measure": "Unit",
  "Price_Hourly": 0.00,
  "Price_Monthly": 0.00,
  "Price_OneTime": 0.00,
  "Price_Setup": 0.00,
  "Source_Excel": true/false,
  "Source_PDF": true/false,
  "Catalog_Name": "Catalog name",
  "Product_Category_Group": "Category",
  "Product_Category_SubGroup": "Subcategory",
  "Price_Charge_Basis": "Charge basis"
}
```

## Browser Compatibility

This catalog works in all modern browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Notes

- Initial load time depends on downloading the ~6.6MB JSON file
- Once loaded, all operations are instant (no server requests)
- The data is cached in browser memory during the session
- Pagination limits display to 100-500 items at once for smooth scrolling

## Support

For issues or questions about the catalog data or Flask version, refer to the main IC4G catalog documentation.