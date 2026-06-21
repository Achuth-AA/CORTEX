// Curated, relevance-ranked product photos keyed by product id.
//
// Each entry maps a product id to an array of real product images served from
// Unsplash's hotlink-friendly CDN. The override loop in products.js swaps these
// in over the keyword fallback URLs. Every id below was verified to return a
// live image. To resize/recrop, change the query string in `u()`.

const u = (id) =>
  `https://images.unsplash.com/photo-${id}?w=600&h=600&fit=crop&q=80`

const set = (...ids) => ids.map(u)

export const productImages = {
  // ---- Electronics ----
  1: set('1505740420928-5e560c06d30e', '1583394838336-acd977736f90', '1484704849700-f032a568e944'), // headphones
  2: set('1579586337278-3befd40fd17a', '1546868871-7041f2a55e12', '1523275335684-37898b6baf30'), // smartwatch
  3: set('1587829741301-dc798b83add3', '1541140532154-b024d705b90a', '1618384887929-16ec33fab9ef'), // keyboard
  4: set('1502920917128-1aa500764cbd', '1526170375885-4d8ecf77b99f'), // action camera
  5: set('1608043152269-423dbba4e7e1', '1589003077984-894e133dabab', '1545454675-3531b543be5d'), // speaker
  6: set('1609091839311-d5365f9ff1c5', '1585338107529-13afc5f02586', '1620288627223-53302f4e8c74'), // power bank

  // ---- Fashion ----
  7: set('1551028719-00167b16eac5', '1592878904946-b3cd8ae243d0', '1520975954732-35dd22299614'), // bomber jacket
  8: set('1584917865442-de89df76afd3', '1548036328-c9fa89d128fa', '1591561954557-26941169b49e'), // leather tote
  9: set('1542291026-7eec264c27ff', '1600185365926-3a2ce3cdb9eb', '1595950653106-6c9ebd614d3a'), // sneakers
  10: set('1572635196237-14b3f281503f', '1511499767150-a48a237f0083', '1473496169904-658ba7c44d8a'), // sunglasses
  11: set('1457545195570-67f207084966', '1601924994987-69e26d50dc26', '1520903920243-00d872a2d1c9'), // scarf
  12: set('1524592094714-0f0654e20314', '1547996160-81dfa63595aa', '1523170335258-f5ed11844a49'), // watch

  // ---- Home Decor ----
  13: set('1578500494198-246f612d3b3d', '1485955900006-10f4d324d411', '1612196808214-b8e1d6145a8c'), // vase
  14: set('1507473885765-e6ed057f782c', '1517991104123-1d56a6e81ed9'), // table lamp
  15: set('1580301762395-21ce84d00bc6', '1600369671236-e74521d4b6ad', '1611591437281-460bfbe1220a'), // throw blanket
  16: set('1563861826100-9cb868fdbe1c', '1509048191080-d2984bad6ae5'), // wall clock
  17: set('1603006905003-be475563bc59', '1572726729207-a78d6feb18d7'), // candle set
  18: set('1416879595882-3373a0480b5b', '1485955900006-10f4d324d411'), // planters

  // ---- Fitness ----
  19: set('1638536532686-d610adfc8e5c', '1571019614242-c5c5dee9f50b', '1605296867304-46d5465a13f1'), // dumbbell
  20: set('1592432678016-e910b452f9a2', '1601925260368-ae2f83cf8b7f', '1544367567-0f2fcb009e0b'), // yoga mat
  21: set('1598289431512-b97b0917affc', '1576678927484-cc907957088c'), // resistance bands
  22: set('1620188467120-5042ed1eb5da', '1571902943202-507ec2618e8f', '1518611012118-696072aa579a'), // foam roller
  23: set('1602143407151-7111542de6e8', '1523362628745-0c100150b504', '1610824352934-c10d87b700cc'), // water bottle
  24: set('1434596922112-19c563067271', '1598971639058-fab3c3109a00', '1591291621164-2c6367723315'), // jump rope
}
