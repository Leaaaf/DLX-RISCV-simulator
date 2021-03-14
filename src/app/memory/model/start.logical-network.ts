import { Injector, Input, Inject, Injectable } from '@angular/core';
import { LogicalNetwork } from './logical-network';

@Injectable()
export class StartLogicalNetwork extends LogicalNetwork {
  //ffd( name, d, a_res, a_set, clk)
  //mux( zero, one, sel)
  //tri( in, en )
  //bd0 = tri( ffd( start, mux( start.q, bd0, cs_write ), reset, null, memwr* ), cs_read )";

  mux_status: number;
  startup: boolean;

  constructor(cs_read: number, cs_write: number, injector: Injector) {
    super('Start', cs_read, cs_write);
    super.devType = "Start";
    this.image = "assets/img/rete-start.png"
    this.cs = [];
    this.a_set_value = "RESET";
    this.a_reset_value = "0";
    this.clkType = "MEMWR*";
    this.mux_status = 1;
    this.startup = false;
    this.setCS("CS_READ_STARTUP", this.min_address, 1);
    this.setCS("CS_WRITE_STARTUP", this.min_address + 0x00000001, 1);
    this.setCS("CS_A_RES_STARTUP", this.min_address + 0x00000002, 0);
    this.setCS("CS_A_SET_STARTUP", this.min_address + 0x00000003, 0);
  }

  public getImageName() {
    const folder = this.clkType == "MEMWR*" ? 'memwr' : 'memrd';
    return ("assets/img/startup/" + folder + "/" + this.a_set_value + "_" + this.a_reset_value + ".jpg").toLowerCase();
  }

  public startOp() {
    console.log("STARTUP ->");
    if (this.a_set_value == "RESET")
      this.a_set();

    if (this.a_reset_value == "RESET")
      this.a_reset();
  }

  public a_set() {
    this.ffd = true;
    this.startup = this.ffd;
    this.setCS("CS_READ_STARTUP", this.min_address, this.startup);
  }

  public a_reset() {
    this.ffd = false;
    this.startup = this.ffd;
    this.setCS("CS_READ_STARTUP", this.min_address, this.startup);
  }

  public load(address: number): number {
    let cs = this.cs.find(el => el.address == address);
    if (this.clkType == "MEMRD*") this.clk();
    if (cs == null) return super.load(address);
    else {
      switch (cs.id) {
        case "CS_READ_STARTUP":
          return this.ffd ? 1 : 0;
      }
    }

    return 0;
  }

  public store(address: number, word: number): void {
    let cs = this.cs.find(el => el.address == address);
    if (cs == null) return super.store(address, word);
    else {
      switch (cs.id) {
        case "CS_WRITE_STARTUP":
          this.ffd = (word & 0x1) == 0x1;
          if ("MEMWR*" == this.clkType)
            this.clk();
          break;
        case "CS_A_SET_STARTUP":
          if (this.a_set_value == "CS_A_SET_STARTUP")
            this.a_set();
          break;
        case "CS_A_RES_STARTUP":
          if (this.a_set_value == "CS_A_RES_STARTUP")
            this.a_reset();
          break;
      }
    }
  }

  public clk() {
    this.startup = this.ffd;
    super.store(this.cs.find(el => el.id == "CS_READ_STARTUP").address, this.ffd ? 1 : 0);
  }
}
