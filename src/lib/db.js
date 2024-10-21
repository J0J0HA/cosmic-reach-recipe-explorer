import Dexie from 'dexie';
import { dataModFiles } from './stores';

export const db = new Dexie('FileStore');
db.version(6).stores({
//   blocks: '&id, source',
  textures: '&path, source, modId, subPath, &[modId+subPath]',
  models: '&path, source, modId, subPath, &[modId+subPath]',
  recipes: '&path, source, modId, subPath, &[modId+subPath]',
  items: '&path, source, modId, subId, &[modId+subId]',
  blocks: '&path, source, modId, subId, &[modId+subId]',
  // blockstates: '&path, source, modId, subId, &[modId+subId+state], state',
});

// TODO: Rem: (await window.db.blocks.where({modId:"base", subId:"furnace"}).toArray())[0]