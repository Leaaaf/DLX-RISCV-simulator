import {Injector, Input, Inject, Injectable} from '@angular/core';
import {LogicalNetwork} from './logical-network';

@Injectable()
export class FFDLogicalNetwork extends LogicalNetwork {
  //ffd( name, d, a_res, a_set, clk)
  //mux( zero, one, sel)
  //tri( in, en )
  //bd0 = tri( ffd( start, mux( start.q, bd0, cs_write ), reset, null, memwr* ), cs_read )";


  constructor(cs_read: number, cs_write: number, injector: Injector) {
    super('FF-D', cs_read, cs_write);
    super.devType = "FF-D";
    this.cs = [];
    this.a_set_value = "RESET";
    this.a_reset_value = "0";
    this.setCS("cs_read_ff",this.min_address,1);
    this.setCS("cs_set_ff",this.min_address + 0x00000001,1);
    this.setCS("cs_reset", this.min_address + 0x00000002, 0);
    this.setCS("cs_set", this.min_address + 0x00000003, 0);
  }

  
  public startOp() {
    if(this.a_set_value == "RESET")
      this.a_set();
    
    if(this.a_reset_value == "RESET")
      this.a_reset();
  }

  public load(address: number): number {
    let res = 0;
    let cs = this.cs.find(el => el.address == address);
    if(cs==null) res = super.load(address);
    else {
      switch(cs.id) {
        case "cs_read_ff":
          res = this.ffd ? 1 : 0;
      }
    }
    
    return res;
  }

  public store(address: number, word: number): void {
    let cs = this.cs.find(el => el.address == address);
    if(cs==null) return super.store(address,word);
    else {
      switch(cs.id) {
        case "cs_set_ff":
          this.ffd = (word & 0x1) == 0x1;
          break;
      }
    }
  }
}
