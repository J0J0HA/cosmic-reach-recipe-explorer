import Dexie from 'dexie';
import { dataModFiles } from './stores';
import { renderBlockModel } from './rendering';

export const db = new Dexie('FileStore');
db.version(2).stores({
  //   blocks: '&id, source',
  textures: '&path, source, modId, subPath, &[modId+subPath]',
  models: '&path, source, modId, subPath, &[modId+subPath]',
  // recipes: '&path, source, modId, subPath, &[modId+subPath]',
  items: '&path, &fullId, source, modId, subId, &[modId+subId]',
  blockstates: '&fullId, blockId, source, modId, subId, state, [modId+subId], &[modId+subId+state], showInCatalog',
});

export class BlockStateTakeableAdapter {
  get name() {
    return this.fullId // get(translations)[this.data.langKey || this.id.split("[")[0]] || this.id;
  }

  get isFuel() {
    return this.data.intProperties?.fuelTicks && this.data.intProperties?.fuelTicks >= 0;
  }

  get burnTime() {
    return this.data.intProperties?.fuelTicks;
  }

  async getImage() {
    const blob = await renderBlockModel(this.data.modelName);
    if (!blob) return null;
    return URL.createObjectURL(blob);
    // return null;
  }

  get lore() {
    let result = [];
    result.push(this.fullId);
    for (let property in this.data) {
      if (property == "dropId") {
        result.push(`Drops: ${this.data[property]}`);
      } else if (property == "catalogHidden") {
        result.push(`Hidden: ${this.data[property]}`);
      } else if (property == "tags") {
        result.push(`Tags: ${this.data[property].join(", ")}`);
      }
    }
    for (let property in this.data.intProperties) {
      if (property == "fuelTicks") {
        result.push(`Burns as fuel: ${this.data.intProperties[property]} ticks`);
      }
    }
    return result;
  }

}

export class ItemTakeableAdapter {
  get isFuel() {
    return this.data.fuelTicks && this.data.fuelTicks >= 0;
  }

  get name() {
    return this.fullId;
  }

  get burnTime() {
    return this.data.fuelTicks;
  }

  get lore() {
    let result = [];
    result.push(this.fullId);
    for (let property in this.data) {
      if (property == "stackLimit") {
        result.push(`Stack Limit: ${this.data[property]}`);
      } else if (property == "durability") {
        result.push(`Max Durability: ${this.data[property]}`);
      } else if (property == "toolSpeed") {
        result.push(`Tool Speed: ${this.data[property]}`);
      } else if (property == "fuelTicks") {
        result.push(`Burns as fuel: ${this.data[property]} ticks`);
      } //else {
      //     result += `${property}: ${this.properties[property]}<br>`;
      // }#
    }
    return result;

  }

  async getImage() {
    // if (this.data.__texture_override) return this.data.__texture_override;
    const texture = (await db.textures.where({modId: this.modId, subPath: this.data.texture}).toArray())[0]?.data;
    return texture ? texture : null;
  }
}

db.items.mapToClass(ItemTakeableAdapter);
db.blockstates.mapToClass(BlockStateTakeableAdapter);

// TODO: Rem: (await window.db.blocks.where({modId:"base", subId:"furnace"}).toArray())[0]