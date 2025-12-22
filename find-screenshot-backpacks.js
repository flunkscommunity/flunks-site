#!/usr/bin/env node
const fcl = require('@onflow/fcl');
fcl.config().put('accessNode.api', 'https://rest-mainnet.onflow.org').put('flow.network', 'mainnet');

async function searchForScreenshotBackpacks() {
  console.log('🔍 Searching for backpacks from screenshot: #492, #5606, #9375, #5449');
  console.log('');
  
  const addressesToCheck = [
    // Known addresses
    '0x6e5d12b1735caa83', // CityofDreams Dapper
    '0x7ab6ddec8328399a', // CityofDreams Flow
    '0x4ab2327b5e1f3ca1', 
    '0xc4ab4a06ade1fd0f',
    '0xbfffec679fff3a94',
    '0x92629c2a389dd8a8',
    
    // Marketplace addresses
    '0xb8ea91944fd51c43',
    '0x18eb4ee6b3c026d2',
    
    // Big holder addresses
    '0x67c86aa6bb0e3d45',
    '0x15e6c52a77e2e8f3',
    '0x81c37872f7f83d33',
    '0xd16dc616bb48bd13',
    '0xd36763d55b1b7b62',
    '0xfcdf0d84055e6ce8',
    '0x9bfc86e97bfe7f4d',
    '0x2444f46ffc1e9ad7',
    '0xa3b35c78f9a39a7c',
    '0x39c6c58c93ba9faf',
    '0x0abe9c16f3b49c61',
    '0xdc13e33cfe73bb94',
    '0x50ddf68aab6e5b10',
    '0x33a7e0d5b3f0f9ca',
    '0x1fb22fc6fce80aef',
  ];
  
  const targetIds = [492, 5606, 9375, 5449];
  const found = {};
  
  for (const addr of addressesToCheck) {
    try {
      const result = await fcl.query({
        cadence: `
          import Backpack from 0x807c3d470888cc48
          access(all) fun main(address: Address): [UInt64] {
            let acct = getAccount(address)
            if let collection = acct.capabilities.borrow<&Backpack.Collection>(Backpack.CollectionPublicPath) {
              return collection.getIDs()
            }
            return []
          }
        `,
        args: (arg, t) => [arg(addr, t.Address)]
      });
      
      for (const targetId of targetIds) {
        if (result.map(String).includes(targetId.toString())) {
          if (!found[targetId]) found[targetId] = [];
          found[targetId].push(addr);
          console.log('✅ Found #' + targetId + ' in:', addr);
        }
      }
    } catch(e) {
      // Skip errors
    }
  }
  
  console.log('');
  console.log('=== RESULTS ===');
  for (const id of targetIds) {
    if (found[id]) {
      console.log('#' + id + ': Found in', found[id].join(', '));
    } else {
      console.log('#' + id + ': NOT FOUND in checked addresses');
    }
  }
}

searchForScreenshotBackpacks();
