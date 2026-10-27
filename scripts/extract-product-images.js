const fs = require('fs');
const path = require('path');

const prods = JSON.parse(fs.readFileSync('data/products.json', 'utf8'));

prods.forEach((prod, pIdx) => {
  if (prod.images) {
    prod.images.forEach((img, iIdx) => {
      if (img.url && img.url.startsWith('data:image/')) {
        const matches = img.url.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
        if (matches) {
          const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
          const filename = `${prod.slug}-custom-${iIdx + 1}.${ext}`;
          const filepath = path.join('public', 'images', 'products', filename);
          fs.writeFileSync(filepath, Buffer.from(matches[2], 'base64'));
          const publicUrl = `/images/products/${filename}`;
          console.log(`Saved ${filepath}`);
          const oldUrl = img.url;
          img.url = publicUrl;
          if (prod.featuredImage === oldUrl || img.isFeatured) {
            prod.featuredImage = publicUrl;
          }
        }
      }
    });
  }
  if (prod.featuredImage && prod.featuredImage.startsWith('data:image/')) {
    const matches = prod.featuredImage.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
    if (matches) {
      const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
      const filename = `${prod.slug}-custom-featured.${ext}`;
      const filepath = path.join('public', 'images', 'products', filename);
      fs.writeFileSync(filepath, Buffer.from(matches[2], 'base64'));
      prod.featuredImage = `/images/products/${filename}`;
      console.log(`Saved featured ${filepath}`);
    }
  }
});

fs.writeFileSync('data/products.json', JSON.stringify(prods, null, 2), 'utf8');
console.log('data/products.json updated cleanly with static image paths!');
