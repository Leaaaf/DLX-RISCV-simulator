import { Injector, Input, Inject, Injectable } from '@angular/core';
import { LogicalNetwork } from './logical-network';

@Injectable()
export class LedLogicalNetwork extends LogicalNetwork {
  //ffd( name, d, a_res, a_set, clk)
  //mux( zero, one, sel)
  //tri( in, en )
  //bd0 = tri( ffd( start, mux( start.q, bd0, cs_write ), reset, null, memwr* ), cs_read )";


  constructor(min_address: number, max_address: number, injector: Injector) {
    super('LED', min_address, max_address);
    super.devType = "Led";
    this.clkType = "MEMWR*";
    this.cs = [];
    this.a_set_value = "RESET";
    this.a_reset_value = "0";
    this.led=false;
    this.setCS("CS_READ_LED", this.min_address, this.led);
    this.setCS("CS_SWITCH_LED", this.min_address + 0x00000001, 1);
    this.setCS("CS_A_RES_LED", this.min_address + 0x00000002, 0);
    this.setCS("CS_A_SET_LED", this.min_address + 0x00000003, 0);
  }

  public getImageName() {
    const folder = this.clkType == "MEMWR*" ? 'memwr' : 'memrd';
    return ("assets/img/led/" + folder + "/" + this.a_set_value + "_" + this.a_reset_value + ".jpg").toLowerCase();
  }

  public startOp() {
    if (this.a_set_value == "RESET")
      this.a_set();

    if (this.a_reset_value == "RESET")
      this.a_reset();
  }

  public a_set() {
    this.ffd = true;
    this.led = this.ffd;
    this.setCS("CS_READ_LED", this.min_address, this.led);
  }

  public a_reset() {
    this.ffd = false;
    this.led = this.ffd;
    this.setCS("CS_READ_LED", this.min_address, this.led);
  }

  public load(address: number): number {
    let cs = this.cs.find(el => el.address == address);
    if (this.clkType == "MEMRD*")
      this.clk();
    if (cs == null) return super.load(address);
    else {
      switch (cs.id) {
        case "CS_READ_LED":
          return this.led ? 1 : 0;
      }
    }
  }

  public store(address: number, word: number): void {
    let cs = this.cs.find(el => el.address == address);
    if (cs == null) return super.store(address, word);
    else {
      switch (cs.id) {
        case "CS_SWITCH_LED":
          this.ffd = this.mux(this.ffd, !this.ffd, 1);
          if ("MEMWR*" == this.clkType)
            this.clk();
          break;
        case "CS_A_SET_LED":
          if (this.a_set_value == "CS_A_SET_LED")
            this.a_set();
          break;
        case "CS_A_RES_LED":
          if (this.a_set_value == "CS_A_RES_LED")
            this.a_reset();
          break;
      }
    }
  }

  public clk = () => { // EXECUTE THE LOGICAL NETWORK CLK
    let CS_READ_LED = this.cs.find(el => el.id == "CS_READ_LED");
    this.led = this.ffd;
    if (CS_READ_LED != null)
      super.store(CS_READ_LED.address, this.led ? 1 : 0);
  }

  public getLedStatus = () => {
    return this.led;
  }

}
