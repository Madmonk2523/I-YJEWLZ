// I&Y JEWLZ - Frontend interactions (GPT-5)
(function () {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const on = (el, evt, fn) => el && el.addEventListener(evt, fn);
  const fmt = (n) => n.toLocaleString(undefined, { style: 'currency', currency: 'USD' });

  // Product catalog (demo data)
  const PRODUCTS = [
    { id: 1, name: 'Diamond Solitaire Ring', category: 'rings', material: 'diamond', collection: 'luxury', price: 2499, originalPrice: 2999, rating: 4.8, reviews: 128, image: 'images/product1.jpg', badge: 'New' },
    { id: 2, name: 'Gold Tennis Bracelet', category: 'bracelets', material: 'gold', collection: 'classic', price: 1799, originalPrice: 1999, rating: 4.7, reviews: 86, image: 'images/product2.jpg', badge: 'Bestseller' },
    { id: 3, name: 'Pearl Drop Earrings', category: 'earrings', material: 'pearl', collection: 'classic', price: 399, originalPrice: 499, rating: 4.6, reviews: 54, image: 'images/product3.jpg' },
    { id: 4, name: 'Platinum Halo Necklace', category: 'necklaces', material: 'platinum', collection: 'luxury', price: 2899, originalPrice: 3299, rating: 4.9, reviews: 72, image: 'images/product4.jpg' },
    { id: 5, name: 'Silver Stackable Rings Set', category: 'rings', material: 'silver', collection: 'modern', price: 129, originalPrice: 159, rating: 4.3, reviews: 33, image: 'images/product5.jpg' },
    { id: 6, name: 'Rose Gold Pendant', category: 'necklaces', material: 'gold', collection: 'modern', price: 799, originalPrice: 899, rating: 4.5, reviews: 40, image: 'images/product6.jpg' },
    { id: 7, name: 'Vintage Sapphire Ring', category: 'rings', material: 'gold', collection: 'vintage', price: 1499, originalPrice: 1699, rating: 4.4, reviews: 22, image: 'images/product7.jpg' },
    { id: 8, name: 'Diamond Stud Earrings', category: 'earrings', material: 'diamond', collection: 'luxury', price: 1199, originalPrice: 1399, rating: 4.8, reviews: 96, image: 'images/product8.jpg' },
    { id: 9, name: 'Men\'s Chrono Watch', category: 'watches', material: 'steel', collection: 'modern', price: 899, originalPrice: 999, rating: 4.2, reviews: 45, image: 'images/product9.jpg' },
    { id: 10, name: 'Emerald Bracelet', category: 'bracelets', material: 'gold', collection: 'luxury', price: 2299, originalPrice: 2599, rating: 4.6, reviews: 28, image: 'images/product10.jpg' },
    { id: 11, name: 'Minimal Silver Necklace', category: 'necklaces', material: 'silver', collection: 'modern', price: 159, originalPrice: 199, rating: 4.1, reviews: 12, image: 'images/product11.jpg' },
    { id: 12, name: 'Ruby Heart Pendant', category: 'necklaces', material: 'gold', collection: 'classic', price: 629, originalPrice: 699, rating: 4.5, reviews: 31, image: 'images/product12.jpg' },
  ];

  // LocalStorage cart helpers
  const CART_KEY = 'iy_cart';
  const WISHLIST_KEY = 'iy_wishlist';

  const getCart = () => {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; }
  };
  const saveCart = (cart) => localStorage.setItem(CART_KEY, JSON.stringify(cart));
  const addToCart = (product, qty = 1, options = {}) => {
    const cart = getCart();
    const idx = cart.findIndex(i => i.id === product.id && i.optionsKey === JSON.stringify(options));
    if (idx > -1) cart[idx].qty += qty; else cart.push({ id: product.id, name: product.name, price: product.price, image: product.image, qty, optionsKey: JSON.stringify(options), options });
    saveCart(cart); updateCartUI();
    showAddToCartNotification(product.name, qty);
  };
  const removeFromCart = (index) => { const c = getCart(); c.splice(index, 1); saveCart(c); updateCartUI(); };
  const updateQty = (index, qty) => { const c = getCart(); c[index].qty = Math.max(1, qty|0); saveCart(c); updateCartUI(); };
  const cartTotals = () => {
    const cart = getCart();
    const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const count = cart.reduce((s, i) => s + i.qty, 0);
    return { subtotal, count };
  };

  // Wishlist helpers
  const getWishlist = () => {
    try { return JSON.parse(localStorage.getItem(WISHLIST_KEY)) || []; } catch { return []; }
  };
  const saveWishlist = (wishlist) => localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  const addToWishlist = (productId) => {
    const wishlist = getWishlist();
    if (!wishlist.includes(productId)) {
      wishlist.push(productId);
      saveWishlist(wishlist);
      updateWishlistUI();
    }
  };
  const removeFromWishlist = (productId) => {
    const wishlist = getWishlist();
    const idx = wishlist.indexOf(productId);
    if (idx > -1) {
      wishlist.splice(idx, 1);
      saveWishlist(wishlist);
      updateWishlistUI();
    }
  };
  const toggleWishlist = (productId) => {
    const wishlist = getWishlist();
    if (wishlist.includes(productId)) removeFromWishlist(productId);
    else addToWishlist(productId);
  };
  const isInWishlist = (productId) => getWishlist().includes(productId);

  // Emoji map for product categories
  const CATEGORY_EMOJI = {
    'rings': '💍',
    'necklaces': '📿',
    'bracelets': '⌚',
    'earrings': '👂',
    'watches': '⌚'
  };

  // UI updates for header and sidebar cart
  function updateCartBadge() {
    const { count } = cartTotals();
    const badge = $('#cartCount');
    if (badge) {
      badge.textContent = count;
      // Trigger pulse animation
      badge.classList.remove('pulse-animation');
      void badge.offsetWidth; // Force reflow
      badge.classList.add('pulse-animation');
      setTimeout(() => badge.classList.remove('pulse-animation'), 600);
    }
  }

  // Add to cart notification
  function showAddToCartNotification(productName, qty) {
    // Remove existing notification if any
    const existing = $('#cartNotification');
    if (existing) existing.remove();

    // Create notification
    const notification = document.createElement('div');
    notification.id = 'cartNotification';
    notification.className = 'cart-notification';
    notification.innerHTML = `
      <div class="cart-notification-icon">
        <i class="fas fa-check"></i>
      </div>
      <div class="cart-notification-content">
        <div class="cart-notification-title">Added to Cart!</div>
        <div class="cart-notification-message">${qty > 1 ? qty + 'x ' : ''}${productName}</div>
      </div>
      <button class="cart-notification-close" onclick="this.parentElement.classList.add('hide')">
        <i class="fas fa-times"></i>
      </button>
    `;

    document.body.appendChild(notification);

    // Show notification with animation
    setTimeout(() => notification.classList.add('show'), 10);

    // Auto-hide after 3 seconds
    setTimeout(() => {
      notification.classList.remove('show');
      notification.classList.add('hide');
      setTimeout(() => notification.remove(), 400);
    }, 3000);
  }

  function renderCartSidebar() {
    const sidebar = $('#cartSidebar');
    const itemsEl = $('#cartItems');
    const totalEl = $('#cartTotal');
    if (!sidebar || !itemsEl || !totalEl) return;
    const cart = getCart();
    itemsEl.innerHTML = cart.map((item, idx) => `
      <div class="cart-item">
        <div class="cart-item-image" style="background-image:url('${item.image}')"></div>
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-qty">Qty: ${item.qty}${item.options?.size ? ` • Size: ${item.options.size}` : ''}${item.options?.metal ? ` • ${item.options.metal.replace('-', ' ')}` : ''}</div>
          <div class="cart-item-price">${fmt(item.price * item.qty)}</div>
        </div>
        <button class="cart-item-remove" data-index="${idx}"><i class="fas fa-trash"></i></button>
      </div>
    `).join('');
    const { subtotal } = cartTotals();
    totalEl.textContent = fmt(subtotal);
    // remove handlers
    $$('.cart-item-remove', itemsEl).forEach(btn => on(btn, 'click', () => removeFromCart(+btn.dataset.index)));
  }

  function openCartSidebar() {
    const sidebar = $('#cartSidebar');
    const overlay = $('#overlay');
    if (!sidebar || !overlay) return;
    sidebar.classList.add('active');
    overlay.classList.add('active');
    renderCartSidebar();
  }
  function closeCartSidebar() {
    const sidebar = $('#cartSidebar');
    const overlay = $('#overlay');
    if (!sidebar || !overlay) return;
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
  }

  function updateCartUI() { updateCartBadge(); renderCartSidebar(); renderCartPage(); }

  // Wishlist UI updates
  function updateWishlistBadge() {
    const wishlist = getWishlist();
    const badge = $('#wishlistCount');
    if (badge) badge.textContent = wishlist.length;
  }

  function renderWishlistSidebar() {
    const itemsEl = $('#wishlistItems');
    if (!itemsEl) return;
    const wishlist = getWishlist();
    const wishlistProducts = PRODUCTS.filter(p => wishlist.includes(p.id));
    
    if (wishlistProducts.length === 0) {
      itemsEl.innerHTML = `
        <div class="empty-wishlist">
          <i class="fas fa-heart"></i>
          <h3>Your wishlist is empty</h3>
          <p>Save your favorite items here</p>
        </div>`;
    } else {
      itemsEl.innerHTML = wishlistProducts.map(p => {
        const emoji = CATEGORY_EMOJI[p.category] || '💎';
        return `
          <div class="wishlist-item">
            <div class="wishlist-item-emoji">${emoji}</div>
            <div class="wishlist-item-info">
              <div class="wishlist-item-name">${p.name}</div>
              <div class="wishlist-item-price">${fmt(p.price)}</div>
              <div class="wishlist-item-actions">
                <button class="btn btn-primary btn-sm add-to-cart-from-wishlist" data-id="${p.id}">
                  <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
              </div>
            </div>
            <button class="wishlist-item-remove" data-id="${p.id}">
              <i class="fas fa-times"></i>
            </button>
          </div>`;
      }).join('');

      // Attach event listeners
      $$('.add-to-cart-from-wishlist', itemsEl).forEach(btn => on(btn, 'click', () => {
        const id = +btn.dataset.id;
        const p = PRODUCTS.find(x => x.id === id);
        if (p) { addToCart(p, 1); }
      }));
      $$('.wishlist-item-remove', itemsEl).forEach(btn => on(btn, 'click', () => {
        removeFromWishlist(+btn.dataset.id);
      }));
    }
  }

  function openWishlistSidebar() {
    const sidebar = $('#wishlistSidebar');
    const overlay = $('#overlay');
    if (!sidebar || !overlay) return;
    closeCartSidebar(); // Close cart if open
    sidebar.classList.add('active');
    overlay.classList.add('active');
    renderWishlistSidebar();
  }

  function closeWishlistSidebar() {
    const sidebar = $('#wishlistSidebar');
    const overlay = $('#overlay');
    if (!sidebar || !overlay) return;
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
  }

  function updateWishlistUI() { 
    updateWishlistBadge(); 
    renderWishlistSidebar(); 
    updateWishlistButtons();
  }

  function updateWishlistButtons() {
    $$('.wishlist-toggle-btn').forEach(btn => {
      const id = +btn.dataset.id;
      const inWishlist = isInWishlist(id);
      const icon = btn.querySelector('i');
      if (icon) {
        icon.className = inWishlist ? 'fas fa-heart' : 'far fa-heart';
      }
    });
  }

  // Product card template
  function productCardHTML(p) {
    const emoji = CATEGORY_EMOJI[p.category] || '💎';
    const inWishlist = isInWishlist(p.id);
    return `
      <div class="product-card">
        ${p.badge ? `<div class="product-badge">${p.badge}</div>` : ''}
        <button class="wishlist-toggle-btn" data-id="${p.id}">
          <i class="${inWishlist ? 'fas' : 'far'} fa-heart"></i>
        </button>
        <a href="product-details.html?pid=${p.id}">
          <div class="product-image product-card-emoji">${emoji}</div>
        </a>
        <div class="product-info">
          <div class="product-category">${p.category}</div>
          <a class="product-name" href="product-details.html?pid=${p.id}">${p.name}</a>
          <div class="product-rating">
            <span class="stars">${'★'.repeat(Math.floor(p.rating))}${p.rating % 1 >= 0.5 ? '½' : ''}</span>
            <span class="rating-count">(${p.reviews})</span>
          </div>
          <div class="product-price-wrapper">
            <span class="product-price">${fmt(p.price)}</span>
            ${p.originalPrice ? `<span class="product-original-price">${fmt(p.originalPrice)}</span>` : ''}
          </div>
          <button class="add-to-cart-btn" data-id="${p.id}"><i class="fas fa-cart-plus"></i> Add to Cart</button>
        </div>
      </div>`;
  }

  // Renderers
  function renderFeatured() {
    const wrap = $('#featuredProducts');
    if (!wrap) return;
    const featured = PRODUCTS.slice(0, 8);
    wrap.innerHTML = featured.map(productCardHTML).join('');
    attachAddToCart(wrap);
  }

  function attachAddToCart(ctx = document) {
    $$('.add-to-cart-btn', ctx).forEach(btn => on(btn, 'click', () => {
      const id = +btn.dataset.id;
      const p = PRODUCTS.find(x => x.id === id);
      if (p) { addToCart(p, 1); }
    }));
    
    // Attach wishlist toggle handlers
    $$('.wishlist-toggle-btn', ctx).forEach(btn => on(btn, 'click', (e) => {
      e.preventDefault();
      const id = +btn.dataset.id;
      toggleWishlist(id);
    }));
  }

  // Shop page logic
  function initShop() {
    const grid = $('#shopProducts');
    if (!grid) return; // not on shop page

    const paginationEl = $('#pagination');
    const sortSelect = $('#sortSelect');
    const priceRange = $('#priceRange');
    const maxPrice = $('#maxPrice');
    const resultsCount = $('#resultsCount');
    const viewBtns = $$('.view-btn');

    const urlParams = new URLSearchParams(location.search);
    const preselectCategory = urlParams.get('category');
    const searchQuery = urlParams.get('search');

    const state = { page: 1, perPage: 9, view: 'grid', sort: 'default', maxPrice: 10000, categories: new Set(), materials: new Set(), collections: new Set(), search: searchQuery || '' };

    // Category checkboxes
    const catBoxes = $$('#categoryFilter input[type="checkbox"]');
    if (preselectCategory) {
      catBoxes.forEach(cb => { if (cb.value === preselectCategory) cb.checked = true; if (cb.value === 'all') cb.checked = false; });
      state.categories = new Set([preselectCategory]);
    } else {
      // if All checked, leave state empty (means all)
      if (!catBoxes.find(cb => cb.value === 'all' && cb.checked)) {
        state.categories = new Set(catBoxes.filter(cb => cb.checked && cb.value !== 'all').map(cb => cb.value));
      }
    }

    function gatherFilters() {
      // categories
      const cats = $$('#categoryFilter input[type="checkbox"]');
      if (cats.find(cb => cb.value === 'all' && cb.checked)) state.categories = new Set();
      else state.categories = new Set(cats.filter(cb => cb.checked && cb.value !== 'all').map(cb => cb.value));
      // materials & collections: any other sidebar checkboxes
      const otherChecks = $$('aside.shop-sidebar input[type="checkbox"]').filter(cb => !cats.includes(cb));
      state.materials = new Set(otherChecks.filter(cb => ['gold','silver','platinum','diamond','pearl','steel'].includes(cb.value) && cb.checked).map(cb => cb.value));
      state.collections = new Set(otherChecks.filter(cb => ['classic','modern','vintage','luxury'].includes(cb.value) && cb.checked).map(cb => cb.value));
      state.maxPrice = priceRange ? +priceRange.value : state.maxPrice;
      state.sort = sortSelect ? sortSelect.value : 'default';
      state.page = 1;
    }

    function applySort(list) {
      switch (state.sort) {
        case 'price-low': return list.slice().sort((a,b)=>a.price-b.price);
        case 'price-high': return list.slice().sort((a,b)=>b.price-a.price);
        case 'name-az': return list.slice().sort((a,b)=>a.name.localeCompare(b.name));
        case 'name-za': return list.slice().sort((a,b)=>b.name.localeCompare(a.name));
        case 'newest': return list.slice().sort((a,b)=> (b.id)-(a.id));
        default: return list;
      }
    }

    function applyFilters() {
      let list = PRODUCTS.filter(p => p.price <= state.maxPrice);
      if (state.categories.size) list = list.filter(p => state.categories.has(p.category));
      if (state.materials.size) list = list.filter(p => state.materials.has(p.material));
      if (state.collections.size) list = list.filter(p => state.collections.has(p.collection));
      // Enhanced search filter with fuzzy matching
      if (state.search) {
        const query = state.search.toLowerCase();
        list = list.filter(p => {
          // Exact match
          const exactMatch = 
            p.name.toLowerCase().includes(query) || 
            p.category.toLowerCase().includes(query) || 
            p.material.toLowerCase().includes(query) || 
            p.collection.toLowerCase().includes(query);
          
          if (exactMatch) return true;
          
          // Fuzzy match for typos
          const fuzzyScore = Math.max(
            fuzzyMatch(p.name, query),
            fuzzyMatch(p.category, query),
            fuzzyMatch(p.material, query),
            fuzzyMatch(p.collection, query)
          );
          
          return fuzzyScore > 0.6;
        });
      }
      return applySort(list);
    }
    
    // Fuzzy matching helper (shared with search)
    function fuzzyMatch(text, query) {
      text = text.toLowerCase();
      query = query.toLowerCase();
      let textIdx = 0;
      let queryIdx = 0;
      let score = 0;
      
      while (textIdx < text.length && queryIdx < query.length) {
        if (text[textIdx] === query[queryIdx]) {
          score++;
          queryIdx++;
        }
        textIdx++;
      }
      
      return queryIdx === query.length ? score / query.length : 0;
    }

    function renderPage() {
      const list = applyFilters();
      const total = list.length;
      const start = (state.page - 1) * state.perPage;
      const pageItems = list.slice(start, start + state.perPage);
      grid.innerHTML = pageItems.map(productCardHTML).join('');
      attachAddToCart(grid);
      if (resultsCount) resultsCount.textContent = total ? `Showing ${start+1}-${Math.min(start+state.perPage,total)} of ${total} products` : 'No products found';
      renderPagination(total);
    }

    function renderPagination(total) {
      if (!paginationEl) return;
      const pages = Math.ceil(total / state.perPage) || 1;
      paginationEl.innerHTML = Array.from({length: pages}, (_,i)=>`<button class="page-btn ${i+1===state.page?'active':''}" data-p="${i+1}">${i+1}</button>`).join('');
      $$('.page-btn', paginationEl).forEach(btn => on(btn, 'click', () => { state.page = +btn.dataset.p; renderPage(); window.scrollTo({top: grid.offsetTop-120, behavior:'smooth'}); }));
    }

    // events
    catBoxes.forEach(cb => on(cb, 'change', () => { if (cb.value === 'all' && cb.checked) catBoxes.forEach(x=>{ if (x!==cb) x.checked=false; }); else $('#categoryFilter input[value="all"]').checked=false; gatherFilters(); renderPage(); }));
    $$('aside.shop-sidebar input[type="checkbox"]').forEach(cb => on(cb, 'change', () => { gatherFilters(); renderPage(); }));
    on(priceRange, 'input', () => { if (maxPrice) maxPrice.textContent = `$${(+priceRange.value).toLocaleString()}`; });
    on(priceRange, 'change', () => { gatherFilters(); renderPage(); });
    on(sortSelect, 'change', () => { gatherFilters(); renderPage(); });
    viewBtns.forEach(btn => on(btn, 'click', () => {
      viewBtns.forEach(b=>b.classList.remove('active')); btn.classList.add('active');
      state.view = btn.dataset.view; if (state.view === 'list') grid.classList.add('list-view'); else grid.classList.remove('list-view');
    }));

    // Shop page quick search filter
    const shopSearchInput = $('#shopSearchInput');
    const shopSearchClear = $('#shopSearchClear');
    const searchMatchCount = $('#searchMatchCount');
    
    if (shopSearchInput) {
      on(shopSearchInput, 'input', () => {
        const query = shopSearchInput.value.trim();
        state.search = query;
        
        // Toggle clear button
        shopSearchClear.style.display = query ? 'block' : 'none';
        
        // Update match count
        const filtered = applyFilters();
        if (query) {
          searchMatchCount.textContent = `${filtered.length} ${filtered.length === 1 ? 'match' : 'matches'} found`;
          searchMatchCount.style.display = 'block';
        } else {
          searchMatchCount.style.display = 'none';
        }
        
        renderPage();
      });
      
      on(shopSearchClear, 'click', () => {
        shopSearchInput.value = '';
        state.search = '';
        shopSearchClear.style.display = 'none';
        searchMatchCount.style.display = 'none';
        renderPage();
        shopSearchInput.focus();
      });
    }
    
    // Reset filters button
    on($('#resetFilters'), 'click', () => {
      // Reset all checkboxes
      $$('aside.shop-sidebar input[type="checkbox"]').forEach(cb => cb.checked = false);
      $('#categoryFilter input[value="all"]').checked = true;
      // Reset price range
      if (priceRange) {
        priceRange.value = 10000;
        if (maxPrice) maxPrice.textContent = '$10,000';
      }
      // Reset sort
      if (sortSelect) sortSelect.value = 'default';
      // Reset shop search
      if (shopSearchInput) {
        shopSearchInput.value = '';
        shopSearchClear.style.display = 'none';
        searchMatchCount.style.display = 'none';
      }
      // Reset state
      state.categories = new Set();
      state.materials = new Set();
      state.collections = new Set();
      state.maxPrice = 10000;
      state.sort = 'default';
      state.page = 1;
      state.search = '';
      renderPage();
    });

    // initial
    if (priceRange && maxPrice) maxPrice.textContent = `$${(+priceRange.value).toLocaleString()}`;
    renderPage();
  }

  // Product details page
  function initProductDetails() {
    const mainImg = $('#mainProductImage');
    const thumbs = $('#thumbnailImages');
    const addBtn = $('#addToCartBtn');
    const titleEl = $('#productTitle');
    const qtyInput = $('#quantityInput');

    if (!titleEl || !addBtn) return; // not on product page

    const params = new URLSearchParams(location.search);
    const pid = +params.get('pid');
    let product = PRODUCTS.find(p => p.id === pid) || PRODUCTS.find(p => p.name === titleEl.textContent.trim()) || PRODUCTS[0];

    if (mainImg) mainImg.src = product.image;
    if (thumbs) {
      // fallback thumbnails from same image
      const imgs = $$('img', thumbs);
      imgs.forEach(img => on(img, 'click', () => {
        imgs.forEach(i => i.classList.remove('active'));
        img.classList.add('active');
        if (mainImg) mainImg.src = img.src;
      }));
    }

    const sizeSelect = $('#sizeSelect');
    const metalBtns = $$('.metal-btn');
    metalBtns.forEach(btn => on(btn, 'click', () => { metalBtns.forEach(b=>b.classList.remove('active')); btn.classList.add('active'); }));

    on($('#increaseQty'), 'click', () => { qtyInput.value = (+qtyInput.value||1) + 1; });
    on($('#decreaseQty'), 'click', () => { qtyInput.value = Math.max(1, (+qtyInput.value||1) - 1); });

    on(addBtn, 'click', () => {
      const qty = Math.max(1, +qtyInput.value || 1);
      const opts = { size: sizeSelect ? sizeSelect.value : '', metal: (metalBtns.find(b=>b.classList.contains('active'))?.dataset.metal) || '' };
      addToCart(product, qty, opts);
    });

    // Add to wishlist button
    const wishlistBtn = $('#addToWishlistBtn');
    on(wishlistBtn, 'click', () => {
      toggleWishlist(product.id);
      const icon = wishlistBtn.querySelector('i');
      if (icon) {
        icon.className = isInWishlist(product.id) ? 'fas fa-heart' : 'far fa-heart';
      }
      // Show feedback
      const originalText = wishlistBtn.innerHTML;
      if (isInWishlist(product.id)) {
        wishlistBtn.innerHTML = '<i class="fas fa-check"></i> Added to Wishlist';
      } else {
        wishlistBtn.innerHTML = '<i class="far fa-heart"></i> Removed';
      }
      setTimeout(() => { wishlistBtn.innerHTML = originalText; }, 2000);
    });

    // Tabs
    const tabBtns = $$('.tab-btn');
    const panes = $$('.tab-pane');
    tabBtns.forEach(btn => on(btn, 'click', () => {
      tabBtns.forEach(b=>b.classList.remove('active')); btn.classList.add('active');
      panes.forEach(p => p.classList.toggle('active', p.id === btn.dataset.tab));
    }));

    // Related products
    const relWrap = $('#relatedProducts');
    if (relWrap) {
      const related = PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0,4);
      relWrap.innerHTML = (related.length? related: PRODUCTS.slice(0,4)).map(productCardHTML).join('');
      attachAddToCart(relWrap);
    }
  }

  // Cart page rendering
  function renderCartPage() {
    const tbody = $('#cartTableBody');
    const emptyState = $('#emptyCart');
    const subtotalEl = $('#cartSubtotal');
    const discountRow = $('#discountRow');
    const discountAmount = $('#discountAmount');
    const shippingCost = $('#shippingCost');
    const taxAmount = $('#taxAmount');
    const grandTotal = $('#cartGrandTotal');

    if (!tbody) return; // not on cart page

    const cart = getCart();
    if (!cart.length) {
      if (emptyState) emptyState.style.display = 'block';
      tbody.innerHTML = '';
    } else {
      if (emptyState) emptyState.style.display = 'none';
      tbody.innerHTML = cart.map((it, idx) => `
        <tr>
          <td>
            <div class="cart-product">
              <div class="cart-product-image" style="background-image:url('${it.image}')"></div>
              <div>
                <div class="cart-product-name">${it.name}</div>
                <div class="cart-product-details">${it.options?.size ? `Size ${it.options.size}` : ''} ${it.options?.metal ? `• ${it.options.metal.replace('-', ' ')}` : ''}</div>
              </div>
            </div>
          </td>
          <td>${fmt(it.price)}</td>
          <td>
            <div class="cart-qty">
              <button data-idx="${idx}" data-delta="-1">-</button>
              <input type="number" value="${it.qty}" min="1" data-idx="${idx}">
              <button data-idx="${idx}" data-delta="1">+</button>
            </div>
          </td>
          <td>${fmt(it.price * it.qty)}</td>
          <td><button class="remove-btn" data-idx="${idx}"><i class="fas fa-trash"></i></button></td>
        </tr>`).join('');
    }

    const { subtotal } = cartTotals();
    const ship = document.querySelector('input[name="shipping"]:checked');
    const shipVal = ship ? +ship.value : 0;
    const discount = (discountRow && discountRow.style.display !== 'none') ? parseFloat((discountAmount.textContent||'0').replace(/[^0-9.-]/g,'')) * -1 : 0;
    const tax = +(subtotal + shipVal + discount) * 0.0875;

    if (subtotalEl) subtotalEl.textContent = fmt(subtotal);
    if (shippingCost) shippingCost.textContent = shipVal ? fmt(shipVal) : 'Free';
    if (taxAmount) taxAmount.textContent = fmt(Math.max(0, tax));
    if (grandTotal) grandTotal.textContent = fmt(Math.max(0, subtotal + shipVal + discount + tax));

    // event handlers
    $$('.cart-qty button', tbody).forEach(btn => on(btn, 'click', () => {
      const idx = +btn.dataset.idx; const delta = +btn.dataset.delta; const c = getCart();
      c[idx].qty = Math.max(1, (c[idx].qty || 1) + delta); saveCart(c); renderCartPage(); updateCartBadge();
    }));
    $$('.cart-qty input', tbody).forEach(inp => on(inp, 'change', () => { updateQty(+inp.dataset.idx, +inp.value || 1); }));
    $$('.remove-btn', tbody).forEach(btn => on(btn, 'click', () => removeFromCart(+btn.dataset.idx)));
  }

  function initCartPageControls() {
    const clearBtn = $('#clearCart');
    const updateBtn = $('#updateCart');
    const applyCoupon = $('#applyCoupon');
    const couponInput = $('#couponInput');
    const couponMsg = $('#couponMessage');
    const discountRow = $('#discountRow');
    const discountAmount = $('#discountAmount');

    if (clearBtn) on(clearBtn, 'click', () => { 
      if (confirm('Are you sure you want to clear your cart?')) {
        saveCart([]); 
        renderCartPage(); 
        updateCartBadge(); 
      }
    });
    if (updateBtn) on(updateBtn, 'click', () => { 
      renderCartPage(); 
      // Show brief confirmation
      const originalText = updateBtn.innerHTML;
      updateBtn.innerHTML = '<i class="fas fa-check"></i> Updated';
      updateBtn.disabled = true;
      setTimeout(() => { 
        updateBtn.innerHTML = originalText;
        updateBtn.disabled = false;
      }, 1500);
    });
    if (applyCoupon) on(applyCoupon, 'click', () => {
      const code = (couponInput.value || '').trim().toUpperCase();
      if (!code) { couponMsg.className = 'coupon-message error'; couponMsg.textContent = 'Please enter a coupon code.'; return; }
      // Simple demo coupons
      const cartSub = cartTotals().subtotal;
      if (code === 'WELCOME10') {
        const discount = +(cartSub * 0.10).toFixed(2);
        discountRow.style.display = 'flex';
        discountAmount.textContent = `-$${discount.toFixed(2)}`;
        couponMsg.className = 'coupon-message success';
        couponMsg.textContent = 'Coupon applied: 10% off!';
      } else if (code === 'FREESHIP') {
        // Simulate free shipping by selecting the free option
        const freeShip = $$('input[name="shipping"]').find(r => +r.value === 0);
        if (freeShip) freeShip.checked = true;
        discountRow.style.display = 'none';
        discountAmount.textContent = '-$0.00';
        couponMsg.className = 'coupon-message success';
        couponMsg.textContent = 'Coupon applied: Free shipping!';
      } else {
        discountRow.style.display = 'none';
        discountAmount.textContent = '-$0.00';
        couponMsg.className = 'coupon-message error';
        couponMsg.textContent = 'Invalid or expired coupon.';
      }
      renderCartPage();
    });

    $$('input[name="shipping"]').forEach(r => on(r, 'change', renderCartPage));
    on($('#proceedCheckout'), 'click', () => alert('Checkout flow is not implemented in this demo.'));
  }

  // Header interactions
  function initHeader() {
    on($('#cartBtn'), 'click', openCartSidebar);
    on($('#cartCloseBtn'), 'click', closeCartSidebar);
    on($('#wishlistBtn'), 'click', openWishlistSidebar);
    on($('#wishlistCloseBtn'), 'click', closeWishlistSidebar);
    on($('#overlay'), 'click', () => {
      closeCartSidebar();
      closeWishlistSidebar();
    });

    // Enhanced Search System
    const searchOverlay = $('#searchOverlay');
    const searchInput = $('#searchInput');
    const searchClearBtn = $('#searchClearBtn');
    const searchSuggestions = $('#searchSuggestions');
    const searchHistory = $('#searchHistory');
    const SEARCH_HISTORY_KEY = 'iyjewlz_search_history';
    
    // Fuzzy matching function
    function fuzzyMatch(text, query) {
      text = text.toLowerCase();
      query = query.toLowerCase();
      let textIdx = 0;
      let queryIdx = 0;
      let score = 0;
      
      while (textIdx < text.length && queryIdx < query.length) {
        if (text[textIdx] === query[queryIdx]) {
          score++;
          queryIdx++;
        }
        textIdx++;
      }
      
      return queryIdx === query.length ? score / query.length : 0;
    }
    
    // Get search suggestions
    function getSearchSuggestions(query) {
      if (!query || query.length < 2) return [];
      
      const suggestions = [];
      const queryLower = query.toLowerCase();
      
      // Search through products
      PRODUCTS.forEach(product => {
        const nameMatch = fuzzyMatch(product.name, query);
        const categoryMatch = fuzzyMatch(product.category, query);
        const materialMatch = fuzzyMatch(product.material, query);
        const collectionMatch = fuzzyMatch(product.collection, query);
        
        const maxMatch = Math.max(nameMatch, categoryMatch, materialMatch, collectionMatch);
        
        if (maxMatch > 0.5 || 
            product.name.toLowerCase().includes(queryLower) ||
            product.category.toLowerCase().includes(queryLower) ||
            product.material.toLowerCase().includes(queryLower) ||
            product.collection.toLowerCase().includes(queryLower)) {
          suggestions.push({
            type: 'product',
            name: product.name,
            category: product.category,
            material: product.material,
            price: product.price,
            match: maxMatch,
            query: query
          });
        }
      });
      
      // Add category suggestions
      const categories = ['rings', 'necklaces', 'earrings', 'bracelets', 'watches'];
      categories.forEach(cat => {
        if (cat.toLowerCase().includes(queryLower) || fuzzyMatch(cat, query) > 0.5) {
          suggestions.push({
            type: 'category',
            name: cat.charAt(0).toUpperCase() + cat.slice(1),
            query: query
          });
        }
      });
      
      // Add material suggestions
      const materials = ['gold', 'silver', 'platinum', 'diamond', 'pearl', 'steel'];
      materials.forEach(mat => {
        if (mat.toLowerCase().includes(queryLower) || fuzzyMatch(mat, query) > 0.5) {
          suggestions.push({
            type: 'material',
            name: mat.charAt(0).toUpperCase() + mat.slice(1),
            query: query
          });
        }
      });
      
      // Sort by match score and limit results
      return suggestions.sort((a, b) => (b.match || 0) - (a.match || 0)).slice(0, 8);
    }
    
    // Highlight matching text
    function highlightMatch(text, query) {
      const regex = new RegExp(`(${query})`, 'gi');
      return text.replace(regex, '<span class="suggestion-highlight">$1</span>');
    }
    
    // Render search suggestions
    function renderSuggestions(suggestions) {
      if (!suggestions || suggestions.length === 0) {
        searchSuggestions.style.display = 'none';
        return;
      }
      
      const list = searchSuggestions.querySelector('.suggestions-list');
      list.innerHTML = suggestions.map(item => {
        let icon = 'fas fa-search';
        let meta = '';
        
        if (item.type === 'product') {
          icon = 'fas fa-gem';
          meta = `${item.category} • ${item.material} • $${item.price.toLocaleString()}`;
        } else if (item.type === 'category') {
          icon = 'fas fa-tags';
          meta = 'Category';
        } else if (item.type === 'material') {
          icon = 'fas fa-cube';
          meta = 'Material';
        }
        
        return `
          <div class="suggestion-item" data-query="${item.name}">
            <i class="${icon}"></i>
            <div class="suggestion-text">
              <div class="suggestion-name">${highlightMatch(item.name, item.query)}</div>
              ${meta ? `<div class="suggestion-meta">${meta}</div>` : ''}
            </div>
          </div>
        `;
      }).join('');
      
      searchSuggestions.style.display = 'block';
      
      // Add click handlers
      $$('.suggestion-item', list).forEach(item => {
        on(item, 'click', () => {
          const query = item.dataset.query;
          searchInput.value = query;
          performSearch(query);
        });
      });
    }
    
    // Get search history
    function getSearchHistory() {
      try {
        return JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || '[]');
      } catch {
        return [];
      }
    }
    
    // Save to search history
    function saveToHistory(query) {
      if (!query || query.length < 2) return;
      
      let history = getSearchHistory();
      history = history.filter(item => item !== query);
      history.unshift(query);
      history = history.slice(0, 5);
      
      try {
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
      } catch {}
    }
    
    // Clear search history
    function clearSearchHistory() {
      try {
        localStorage.removeItem(SEARCH_HISTORY_KEY);
        searchHistory.style.display = 'none';
      } catch {}
    }
    
    // Render search history
    function renderSearchHistory() {
      const history = getSearchHistory();
      
      if (history.length === 0) {
        searchHistory.style.display = 'none';
        return;
      }
      
      const list = searchHistory.querySelector('.history-list');
      list.innerHTML = history.map(query => `
        <div class="history-item" data-query="${query}">
          <i class="fas fa-history"></i>
          <div class="suggestion-text">
            <div class="suggestion-name">${query}</div>
          </div>
        </div>
      `).join('');
      
      searchHistory.style.display = 'block';
      
      // Add click handlers
      $$('.history-item', list).forEach(item => {
        on(item, 'click', () => {
          const query = item.dataset.query;
          searchInput.value = query;
          performSearch(query);
        });
      });
    }
    
    // Perform search
    function performSearch(query) {
      if (!query) return;
      
      saveToHistory(query);
      searchOverlay?.classList.remove('active');
      window.location.href = `shop.html?search=${encodeURIComponent(query)}`;
    }
    
    // Open search overlay
    on($('#searchBtn'), 'click', () => {
      searchOverlay?.classList.add('active');
      searchInput?.focus();
      
      // Show history if input is empty
      if (!searchInput.value) {
        renderSearchHistory();
        searchSuggestions.style.display = 'none';
      }
    });
    
    // Close search overlay
    on($('#searchCloseBtn'), 'click', () => {
      searchOverlay?.classList.remove('active');
      searchSuggestions.style.display = 'none';
      searchHistory.style.display = 'none';
    });
    
    // Close on escape key
    on(document, 'keydown', (e) => {
      if (e.key === 'Escape' && searchOverlay?.classList.contains('active')) {
        searchOverlay.classList.remove('active');
        searchSuggestions.style.display = 'none';
        searchHistory.style.display = 'none';
      }
    });
    
    // Clear search input
    on(searchClearBtn, 'click', () => {
      searchInput.value = '';
      searchClearBtn.style.display = 'none';
      searchSuggestions.style.display = 'none';
      renderSearchHistory();
      searchInput.focus();
    });
    
    // Search input events
    on(searchInput, 'input', () => {
      const query = searchInput.value.trim();
      
      // Toggle clear button
      searchClearBtn.style.display = query ? 'flex' : 'none';
      
      if (query.length >= 2) {
        const suggestions = getSearchSuggestions(query);
        renderSuggestions(suggestions);
        searchHistory.style.display = 'none';
      } else if (query.length === 0) {
        searchSuggestions.style.display = 'none';
        renderSearchHistory();
      } else {
        searchSuggestions.style.display = 'none';
        searchHistory.style.display = 'none';
      }
    });
    
    on(searchInput, 'keypress', (e) => {
      if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query) {
          performSearch(query);
        }
      }
    });
    
    // Clear history button
    on($('#clearHistoryBtn'), 'click', clearSearchHistory);

    on($('#mobileMenuBtn'), 'click', () => $('#navMenu')?.classList.toggle('active'));
  }

  // Hero slider
  function initHeroSlider() {
    const slides = $$('.hero-slide');
    const dotsWrap = $('#heroDots');
    if (!slides.length || !dotsWrap) return;
    let idx = slides.findIndex(s => s.classList.contains('active')) || 0;

    function setActive(i) {
      slides.forEach(s => s.classList.remove('active'));
      slides[i].classList.add('active');
      if (dotsWrap) {
        dotsWrap.querySelectorAll('.hero-dot').forEach((d, di) => d.classList.toggle('active', di === i));
      }
      idx = i;
    }

    dotsWrap.innerHTML = slides.map((_, i) => `<div class="hero-dot ${i===idx?'active':''}" data-i="${i}"></div>`).join('');
    $$('.hero-dot', dotsWrap).forEach(dot => on(dot, 'click', () => setActive(+dot.dataset.i)));
    on($('#heroArrowLeft'), 'click', () => setActive((idx - 1 + slides.length) % slides.length));
    on($('#heroArrowRight'), 'click', () => setActive((idx + 1) % slides.length));

    setInterval(() => setActive((idx + 1) % slides.length), 6000);
  }

  // Wishlist initialization
  function initWishlist() {
    updateWishlistBadge();
    
    // Add handler for product details wishlist button if exists
    const detailsWishlistBtn = $('#addToWishlistBtn');
    if (detailsWishlistBtn) {
      on(detailsWishlistBtn, 'click', () => {
        const urlParams = new URLSearchParams(location.search);
        const pid = +urlParams.get('pid');
        if (pid) {
          toggleWishlist(pid);
          const icon = detailsWishlistBtn.querySelector('i');
          if (icon) {
            icon.className = isInWishlist(pid) ? 'fas fa-heart' : 'far fa-heart';
          }
        }
      });
      
      // Set initial state
      const urlParams = new URLSearchParams(location.search);
      const pid = +urlParams.get('pid');
      if (pid) {
        const icon = detailsWishlistBtn.querySelector('i');
        if (icon) {
          icon.className = isInWishlist(pid) ? 'fas fa-heart' : 'far fa-heart';
        }
      }
    }
  }

  // Forms and interactive elements
  function initForms() {
    on($('#contactForm'), 'submit', (e) => { e.preventDefault(); alert('Thanks for contacting us. We\'ll get back to you shortly.'); e.target.reset(); });
    
    // FAQ accordion functionality
    $$('.faq-item h3').forEach(heading => {
      on(heading, 'click', () => {
        const item = heading.parentElement;
        const isActive = item.classList.contains('active');
        // Close all FAQ items
        $$('.faq-item').forEach(faq => faq.classList.remove('active'));
        // Open clicked item if it wasn't active
        if (!isActive) item.classList.add('active');
      });
    });
    
    // Category dropdown toggle
    $$('.dropdown-toggle').forEach(toggle => {
      on(toggle, 'click', (e) => {
        e.preventDefault();
        const dropdown = toggle.parentElement;
        dropdown.classList.toggle('active');
      });
    });
    
    // Close dropdowns when clicking outside
    on(document, 'click', (e) => {
      if (!e.target.closest('.nav-item.dropdown')) {
        $$('.nav-item.dropdown').forEach(dd => dd.classList.remove('active'));
      }
    });
  }

  // Image placeholders
  function applyPlaceholders() {
    // Replace missing <img> with placeholder
    $$('img').forEach(img => {
      img.onerror = () => { img.onerror = null; const w = img.width || 400; const h = img.height || 400; img.src = `https://picsum.photos/${w||400}/${h||400}?random=${Math.floor(Math.random()*1000)}`; };
    });
    // Background elements
    const heroImgs = $$('.hero-image');
    heroImgs.forEach((el, i) => { const bg = getComputedStyle(el).backgroundImage; if (bg.includes('images/')) el.style.backgroundImage = `url('https://picsum.photos/1200/600?random=${i+1}')`; });
    const catImgs = $$('.category-image');
    catImgs.forEach((el, i) => { const bg = getComputedStyle(el).backgroundImage; if (bg.includes('images/')) el.style.backgroundImage = `url('https://picsum.photos/600/400?random=${i+11}')`; });
    const prodImgs = $$('.product-image');
    prodImgs.forEach((el, i) => { const bg = getComputedStyle(el).backgroundImage; if (bg.includes('images/')) el.style.backgroundImage = `url('https://picsum.photos/600/600?random=${i+21}')`; });
  }

  // Recommended on cart page
  function renderRecommended() {
    const wrap = $('#recommendedProducts');
    if (!wrap) return;
    const rec = PRODUCTS.slice(0, 8);
    wrap.innerHTML = rec.map(productCardHTML).join('');
    attachAddToCart(wrap);
  }

  // Scroll animations
  function initScrollAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe sections and cards
    const animatedElements = $$(`.feature-card, .category-card, .product-card, .testimonial-card, 
                                 .section-header, .about-content, .contact-card, .faq-item`);
    
    animatedElements.forEach((el, idx) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      el.style.transitionDelay = `${idx * 0.05}s`;
      observer.observe(el);
    });

    // Parallax effect for emojis
    let ticking = false;
    on(window, 'scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrolled = window.pageYOffset;
          const heroEmojis = $$('.hero-emoji');
          heroEmojis.forEach(emoji => {
            if (emoji.offsetParent) {
              emoji.style.transform = `translateY(${scrolled * 0.2}px)`;
            }
          });
          
          // Parallax for category emojis
          $$('.category-emoji').forEach((emoji, idx) => {
            const rect = emoji.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
              const offset = (window.innerHeight - rect.top) * 0.05;
              emoji.style.transform = `translateY(${offset}px) rotate(${offset * 0.2}deg)`;
            }
          });
          
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  // Smooth scroll for anchor links
  function initSmoothScroll() {
    $$('a[href^="#"]').forEach(anchor => {
      on(anchor, 'click', (e) => {
        const href = anchor.getAttribute('href');
        if (href === '#' || !href) return;
        const target = $(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  // Page load animation - DISABLED to remove flash effect
  function initPageLoad() {
    // Flash effect removed - page loads normally without fade-in
    // document.body.style.opacity = '0';
    // window.addEventListener('load', () => {
    //   document.body.style.transition = 'opacity 0.5s ease';
    //   document.body.style.opacity = '1';
    // });
  }

  // Count up animation for numbers
  function animateCount(element, target) {
    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        element.textContent = Math.ceil(target);
        clearInterval(timer);
      } else {
        element.textContent = Math.ceil(current);
      }
    }, 20);
  }

  // Initialize
  document.addEventListener('DOMContentLoaded', () => {
    initPageLoad();
    initHeader();
    renderFeatured();
    initShop();
    initProductDetails();
    initHeroSlider();
    initWishlist();
    initForms();
    renderRecommended();
    applyPlaceholders();
    updateCartUI();
    initCartPageControls();
    initScrollAnimations();
    initSmoothScroll();
  });
})();
