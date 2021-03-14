import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LogicalNetwork } from '../memory/model/logical-network';

@Component({
  templateUrl: './logical-network-dialog.component.html',
})
export class LogicalNetworkDialogComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data: {network : LogicalNetwork}) {}

}
