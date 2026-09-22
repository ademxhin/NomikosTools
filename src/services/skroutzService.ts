import { Product } from '../types/product';

export const skroutzService = {
  generateXmlFeed(products: Product[]): string {
    const activeProducts = products.filter((p) => p.active);
    const dateStr = new Date().toISOString();

    const itemsXml = activeProducts
      .map((p) => {
        const availability =
          p.availabilityStatus === 'in_stock'
            ? 'Άμεση παραλαβή / Παράδοση 1 έως 3 ημέρες'
            : p.availabilityStatus === 'low_stock'
            ? 'Περιορισμένο απόθεμα / 1 έως 3 ημέρες'
            : 'Παράδοση 4 έως 10 ημέρες';

        const finalPrice = (p.salePrice || p.price).toFixed(2);

        return `    <product>
      <id>${p.id}</id>
      <name><![CDATA[${p.name}]]></name>
      <link>https://nomikostools.gr/product/${p.slug}</link>
      <image>${p.images[0] || ''}</image>
      <category><![CDATA[Επαγγελματικά Εργαλεία]]></category>
      <price_with_vat>${finalPrice}</price_with_vat>
      <vat>24</vat>
      <availability>${availability}</availability>
      <manufacturer><![CDATA[${p.brandId.replace('brand-', '').toUpperCase()}]]></manufacturer>
      <mpn>${p.manufacturerCode || p.sku}</mpn>
      <ean>${p.ean}</ean>
      <instock>${p.stockQuantity > 0 ? 'Y' : 'N'}</instock>
      <weight>${p.weight ? Math.round(p.weight * 1000) : 1000}</weight>
    </product>`;
      })
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<webstore created_at="${dateStr}">
  <products>
${itemsXml}
  </products>
</webstore>`;
  },
};
