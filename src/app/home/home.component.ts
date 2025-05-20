import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {MaterialModule} from '../shared/material/material.module'
@Component({
  selector: 'app-home',
  imports: [RouterLink,MaterialModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
constructor(){
}
}
