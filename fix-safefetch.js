const fs = require('fs');
let code = fs.readFileSync('src/Storefront.tsx', 'utf8');

const oldFetch = `    const safeFetch = (url) => fetch(url).then(res => {
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return res.json();
      }
      return res.text().then(text => {
        console.error('Non-JSON response from', url, ':', text);
        return [];
      });
    }).catch(err => {
      if (err.message !== 'Failed to fetch') {
        console.error('Fetch error from', url, ':', err);
      }
      return [];
    });`;

const newFetch = `    const safeFetch = async (url: string, retries = 3, delay = 1000): Promise<any> => {
      try {
        const res = await fetch(url);
        if (res.status === 429) {
          if (retries > 0) {
            await new Promise(r => setTimeout(r, delay));
            return safeFetch(url, retries - 1, delay * 2);
          }
        }
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return await res.json();
        }
        const text = await res.text();
        if (text.includes('Rate exceeded') && retries > 0) {
          await new Promise(r => setTimeout(r, delay));
          return safeFetch(url, retries - 1, delay * 2);
        }
        console.error('Non-JSON response from', url, ':', text);
        return [];
      } catch (err: any) {
        if (err.message !== 'Failed to fetch') {
          console.error('Fetch error from', url, ':', err);
        }
        return [];
      }
    };`;

code = code.replace(oldFetch, newFetch);
fs.writeFileSync('src/Storefront.tsx', code);
