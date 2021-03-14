import { Injector, Inject } from '@angular/core';
import { Device, IDevice } from './device';
import { Eprom } from './eprom';
import { StartLogicalNetwork } from './start.logical-network';
import { LedLogicalNetwork } from './led.logical-network';
import { callbackify } from 'util';
import { FFDLogicalNetwork } from './ffd-logical-network';

export class Memory {
  devices: Device[] = [];

  public firstFreeAddr(startAddr): number {
    for (let i = 0; i < this.devices.length - 1; i++) {
      if ((this.devices[i + 1].min_address - this.devices[i].max_address) >= 33554432 && this.devices[i + 1].max_address > startAddr) {
        return this.devices[i].max_address + (33554432 / 2);
      }
    }
    return 0;
  }

  constructor(struct?: string, injector?: Injector) {
    if (struct) {
      JSON.parse(struct).forEach(el => {
        console.log(el.proto);
        switch (el.proto) {
          case Eprom.name:
            this.add(Eprom, el.min_address, el.max_address, injector);
            break;
          case StartLogicalNetwork.name:
            this.add(StartLogicalNetwork, el.min_address, el.max_address, injector);
            break;

          case LedLogicalNetwork.name:
            this.add(LedLogicalNetwork, el.min_address, el.max_address, injector);
            break;

            case FFDLogicalNetwork.name:
              this.add(FFDLogicalNetwork, el.min_address, el.max_address, injector);
              break;
  
          default:
            this.add(el.name, el.min_address, el.max_address);
            break;
        }
      });
    }
  }

  public add(name: string | IDevice, min_address: number, max_address: number, injector?: Injector): void {
    if (this.devices.every(dev => !(dev.checkAddress(min_address) || dev.checkAddress(max_address)))) {
      if (typeof name == 'string') {
        this.devices.push(new Device(name, min_address, max_address));
      } else {
        this.devices.push(new name(min_address, max_address, injector));
      }
      this.devices = this.devices.sort((a, b) => a.min_address - b.min_address);
    }
  }

  public get(name: string): Device {
    return this.devices.find(dev => dev.name === name);
  }

  public remove(dev: Device): void {
    this.devices = this.devices.filter(device => device != dev);
  }

  public load(address: number): number {
    let device = this.devices.find(dev => dev.checkAddress(address));
    if (device) {
      let res = device.load(address);
      return res;
    } else {
      throw new Error('Device not found');
    }
  }

  public store(address: number, word: number): number {
    let device = this.devices.find(dev => dev.checkAddress(address));
    if (device) {
      device.store(address, word);
    } else {
      throw new Error('Device not found');
    }
    return word;
  }
  
}
