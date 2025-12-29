const { getProduct } = require('./src/lib/actions');

async function test() {
    console.log('Testing getProduct for "ignite-v50"...');
    try {
        const product = await getProduct('ignite-v50');
        console.log('Result:', product);
    } catch (e) {
        console.error('Error:', e);
    }
}

test();
