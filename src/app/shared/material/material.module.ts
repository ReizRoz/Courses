import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
// ... ייבוא מודולים נוספים של Material ...
import { MatButtonModule } from '@angular/material/button'; // וודא שזה קיים
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';

const materialModules = [
  // ...
  MatButtonModule, // וודא שזה קיים כאן
  MatCardModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatOptionModule
];

@NgModule({
  imports: [
    CommonModule,
    ...materialModules
  ],
  exports: [
    ...materialModules, 
  // וודא שזה מיוצא
  ]
})
export class MaterialModule { }