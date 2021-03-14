import { animate, style, transition, trigger } from '@angular/animations';
import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MessageDialogComponent } from '../dialogs/message-dialog.component';
import { MemoryService } from '../services/memory.service';
import { Device } from './model/device';
import { LogicalNetwork } from './model/logical-network';
import { LogicalNetworkDialogComponent } from '../dialogs/logical-network-dialog.component';
import { MemoryAddressDialogComponent } from '../dialogs/memory-address-dialog.component';
import { LedLogicalNetwork } from './model/led.logical-network';
import { FFDLogicalNetwork } from './model/ffd-logical-network';
import { ImageDialogComponent } from '../dialogs/image-dialog.component';

@Component({
  selector: 'app-memory',
  templateUrl: './memory.component.html',
  styleUrls: ['./memory.component.sass'],
  animations: [
    trigger('showHideTrigger', [
      transition(':enter', [
        style({ transform: 'translateY(-100%)' }),
        animate('200ms ease-out', style({ transform: 'translateY(0)' })),
      ]),
      transition(':leave', [
        animate('200ms ease-out', style({ transform: 'translateY(-100%)' }))
      ])
    ])
  ],
})

export class MemoryComponent implements OnInit {
  selected: Device;
  @Input() memoryService: MemoryService;

  get canMoveSelectedLeft(): boolean {
    let devices = this.memoryService.memory.devices;
    let index = devices.indexOf(this.selected);
    return (this.selected.name !== 'EPROM' && this.selected.name != 'RAM B') &&
      (index > 0);
  }

  get canMoveSelectedRight(): boolean {
    let devices = this.memoryService.memory.devices;
    let index = devices.indexOf(this.selected);
    return (this.selected.name !== 'EPROM') &&
      (index < devices.length - 1);
  }

  constructor(private dialog: MatDialog) {
  }

  ngOnInit() {
  }

  openDialogImage(n) {
    this.dialog.open(LogicalNetworkDialogComponent, {
      data: { network: n}
    });
  }

  onAdd() {
    let firstAdd = this.memoryService.memory.firstFreeAddr(0) + 1;
    this.memoryService.add('New', firstAdd, firstAdd + 0x01FFFFFF);
    this.memoryService.save();
  }

  onAddFFD() {
    let firstAdd = this.memoryService.memory.firstFreeAddr(0x20000000) + 1;
    this.memoryService.add(FFDLogicalNetwork, firstAdd, firstAdd + 0x00000001);
    this.memoryService.save();
  }

  onAddLed() {
    let firstAdd = this.memoryService.memory.firstFreeAddr(0x20000000) + 1;
    this.memoryService.add(LedLogicalNetwork, firstAdd, firstAdd + 0x0000000C);
    this.memoryService.save();
  }


  onDelete(dev: Device) {
    this.memoryService.remove(dev);
    this.selected = null;
    this.memoryService.save();
  }

  onChangeCS(newValue: string, id: string) {
    let devices = this.memoryService.memory.devices;
    let indexSelectedDevice = this.memoryService.memory.devices.indexOf(this.selected);
    let cs = devices[indexSelectedDevice].cs.find(el => el.id == id);
    if (cs == null) return;
    if (newValue.length == 8) {
      let iv = parseInt(newValue, 16);
      if (iv || iv === 0) {
        cs.address = iv >>> 2;
      }
    }
    cs.hexAddress = newValue;
    console.log(cs);
  }

  onChange(event: any, side: string) {
    let devices = this.memoryService.memory.devices;
    let indexSelectedDevice = this.memoryService.memory.devices.indexOf(this.selected);
    if (side == 'min') {
      if (this.selected.min_address <= devices[indexSelectedDevice - 1].max_address) {
        this.selected.setMinAddress(devices[indexSelectedDevice - 1].max_address + 1);
      }
    } else if (side == 'max') {
      if (this.selected.max_address >= devices[indexSelectedDevice + 1].min_address) {
        this.selected.setMaxAddress(devices[indexSelectedDevice + 1].min_address - 1);
      }
    }
    if (parseInt(this.selected.size) >= 128 || this.selected instanceof LogicalNetwork) {
      this.memoryService.save();
    } else {
      this.dialog.open(MessageDialogComponent, {
        data: { message: 'Memory is less than 128MB' }
      });
    }
  }

  moveSelectedLeft() {
    let endAddress = 0;
    let indexSelectedDevice = this.memoryService.memory.devices.indexOf(this.selected);
    let sizeOfSelected = this.selected.max_address - this.selected.min_address;
    let spaceBeforeFirstDevice = this.memoryService.memory.devices[indexSelectedDevice].min_address - this.memoryService.memory.devices[indexSelectedDevice - 1].max_address;
    if (spaceBeforeFirstDevice >= 33554432) {
      this.selected.setMaxAddress(this.selected.max_address - 33554432);
      this.selected.setMinAddress(this.selected.min_address - 33554432);
    } else if ((endAddress = this.spaceBetweenDevices(indexSelectedDevice, sizeOfSelected, 'left')) != 0) {
      this.selected.setMaxAddress(endAddress - 1);
      this.selected.setMinAddress(this.selected.max_address - sizeOfSelected);
    }

    this.memoryService.memory.devices = this.memoryService.memory.devices.sort((a, b) => a.min_address - b.min_address);
    this.memoryService.save();
  }

  moveSelectedRight() {
    let startAddress = 0;
    let indexSelectedDevice = this.memoryService.memory.devices.indexOf(this.selected);
    let sizeOfSelected = this.selected.max_address - this.selected.min_address;
    let spaceBeforeFirstDevice = this.memoryService.memory.devices[indexSelectedDevice + 1].min_address - this.memoryService.memory.devices[indexSelectedDevice].max_address;
    if (spaceBeforeFirstDevice >= 33554432) {                                                            // Muovi avanti 128Mb se c'è abbastanza spazio
      this.selected.setMaxAddress(this.selected.max_address + 33554432);
      this.selected.setMinAddress(this.selected.min_address + 33554432);
    } else if ((startAddress = this.spaceBetweenDevices(indexSelectedDevice, sizeOfSelected, 'right')) != 0) {   // Muovi tra due device avanti a me
      this.selected.setMinAddress(startAddress + 1);
      this.selected.setMaxAddress(this.selected.min_address + sizeOfSelected);
    }
    this.memoryService.memory.devices = this.memoryService.memory.devices.sort((a, b) => a.min_address - b.min_address);
    this.memoryService.save();
  }

  private spaceBetweenDevices(indexSelectedDevice: number, sizeOfSelected: number, side: string): number {
    for (let i = indexSelectedDevice; i < this.memoryService.memory.devices.length - 2 && side == 'right'; i++) {
      if ((this.memoryService.memory.devices[i + 2].min_address - this.memoryService.memory.devices[i + 1].max_address) >= sizeOfSelected) {
        return this.memoryService.memory.devices[i + 1].max_address;
      }
    }
    for (let i = indexSelectedDevice; i > 1 && side == 'left'; i--) {
      if ((this.memoryService.memory.devices[i - 1].min_address - this.memoryService.memory.devices[i - 2].max_address) >= sizeOfSelected) {
        return this.memoryService.memory.devices[i - 1].min_address;
      }
    }
    return 0;
  }

  readMemoryAddressValues(addr) {
    let finalAddr;
    let iv = parseInt(addr, 16);
    if (iv || iv === 0) {
      finalAddr = iv >>> 2;
    }
    let d = this.memoryService.memory.devices.find(el => el.min_address <= finalAddr && el.max_address >= finalAddr);
    let arrData = [];
    for (let i = 0; i < 10; i++) {
      let v = d.load(finalAddr + (i * 0x00000001));
      arrData.push(
        {
          value: v ? v : 0,
          address: finalAddr + (i * 0x00000001),
          hexAddress: d.getAddressHex(finalAddr + (i * 0x00000001))
        });
    }

    this.dialog.open(MemoryAddressDialogComponent, {
      data: { values: arrData, service: this.memoryService },
    });
  }

  isLN(dev: Device) {
    return dev instanceof LogicalNetwork;
  }

  openImageInterrupt() {
    this.dialog.open(ImageDialogComponent, {
      data: { src: "assets/img/rete-interrupt.jpg" }
    });
  }
}
