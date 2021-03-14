import { Injector } from '@angular/core';

export interface IDevice {
  new(min_address: number, max_address: number, injector: Injector): Device;
}

export class Device {
  name: string;
  private memory: number[];
  min_address: number;
  max_address: number;
  cs: Array<{ id: string, address: number, hexAddress: string }>;
  devType: string;

  public get min_address_hex(): string {
    return ((this.min_address << 2) >>> 0).toString(16).toUpperCase().padStart(8, '0');
  }

  getCsValue(csId) {
    if (null == this.cs) return 0;
    let cs = this.cs.find(el => el.id == csId);
    return cs ? this.memory[cs.address - this.min_address] : 0;
  }

  public isALedNetwork() {
    return null != this.cs.find(el => el.id == "CS_READ_LED");
  }

  public isAStartNetwork() {
    return null != this.cs.find(el => el.id == "CS_READ_STARTUP");
  }

  public set min_address_hex(v: string) {
    let last_min_address = this.min_address;
    if (v.length == 8) {
      let iv = parseInt(v, 16);
      if (iv || iv === 0) {
        this.min_address = iv >>> 2;
      }
    }
    if (last_min_address)
      this.updateCsMin(last_min_address);
  }

  public get max_address_hex(): string {
    if (this.max_address.toString(16).substring(4, 8) == "ffff" || this.max_address.toString(16).substring(4, 8) == "fff")
      return ((this.max_address << 2) + 3 >>> 0).toString(16).toUpperCase().padStart(8, '0');
    else
      return ((this.max_address << 2) >>> 0).toString(16).toUpperCase().padStart(8, '0');
  }

  public set max_address_hex(v: string) {
    let last_max_address = this.max_address;
    if (v.length == 8) {
      let iv = parseInt(v, 16);
      if (iv || iv === 0) {
        this.max_address = iv >>> 2;
      }
    }
    if (last_max_address)
      this.updateCsMax(last_max_address);
  }

  public get size(): string {
    //1 address = 4 byte so
    //262144 = 1024 * 1024 / 4
    return Math.ceil(((this.max_address - this.min_address + 1) / 262144)) + 'MB';
  }

  constructor(name: string, min_address: number, max_address: number) {
    this.name = name;
    this.memory = [];
    this.min_address = min_address;
    this.max_address = max_address;
    this.cs = [];
    this.devType = "RAM";
  }

  public setMaxAddress(v: number) {
    let last_max_address = this.max_address;
    this.max_address = v;
    this.updateCsMax(last_max_address);
  }

  public setMinAddress(v: number) {
    let last_min_address = this.min_address;
    this.min_address = v;
    this.updateCsMin(last_min_address);
  }

  private updateCsMax(last_max_address: number) {
    if (this.cs) {
      this.cs.forEach(el => {
        if (el.address > this.max_address) {
          el.address = this.max_address - (last_max_address - el.address);
          el.hexAddress = this.getAddressHex(el.address);
        }
      })
    }
  }

  private updateCsMin(last_min_address: number) {
    if (this.cs)
      this.cs.forEach(el => {
        if (el.address < this.min_address) {
          el.address = this.min_address + (el.address - last_min_address);
          el.hexAddress = this.getAddressHex(el.address);
        }
      })
  }

  public getAddressHex = (addr) => {
    return ((addr << 2) >>> 0).toString(16).toUpperCase().padStart(8, '0');
  }

  public setCS = (name, addr, value) => {
    let val = this.cs.find(el => el.id == name);
    if (val) val.address = addr;
    else this.cs.push({ id: name, address: addr, hexAddress: this.getAddressHex(addr) });
    this.memory[addr - this.min_address] = value;
  }

  public checkAddress(address: number): boolean {
    return this.min_address <= address && address <= this.max_address;
  }

  public load(address: number): number {
    let res = this.memory[address - this.min_address];
    return res;
  }

  public store(address: number, word: number): void {
    this.memory[address - this.min_address] = word;
  }
}
