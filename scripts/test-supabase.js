process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://uuohtsupzecjnqukggqh.supabase.co',
  'sb_publishable_vqooUCojSsXxvuirPixSqw_MInDcJg6'
);

async function check() {
  const prods = await supabase.from('products').select('id, name, price');
  const orders = await supabase.from('orders').select('id, order_number');
  const reviews = await supabase.from('reviews').select('id, name');

  console.log('PRODUCTS RESULT:', prods.data ? `${prods.data.length} products found:` : prods.error);
  if (prods.data) console.log(prods.data);

  console.log('ORDERS RESULT:', orders.data ? `${orders.data.length} orders found:` : orders.error);
  if (orders.data) console.log(orders.data);

  console.log('REVIEWS RESULT:', reviews.data ? `${reviews.data.length} reviews found:` : reviews.error);
  if (reviews.data) console.log(reviews.data);
}

check();
