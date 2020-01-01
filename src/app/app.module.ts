import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NaturalType } from './pipes/naturalPipe';

/* Material Stuff */
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule} from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatListModule } from '@angular/material/list';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTreeModule } from '@angular/material/tree';
import { MatMenuModule } from '@angular/material/menu';
import { MatDatepickerModule } from '@angular/material/datepicker';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { FirstScreenComponent } from './first-screen/first-screen.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

// services
import { AuthService } from './services/auth.service';
import { HeaderService } from './services/header.service';
import { AdminGuard } from './services/admin.guard.service';
import { AuthGuard } from './services/auth.guard.service';
import { AdminComponent } from './admin/admin.component';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import { AdminBookComponent } from './admin-book/admin-book.component';
import { TeeTimesComponent } from './tee-times/tee-times.component';
import { MemberCardComponent } from './member-card/member-card.component';
import { AdminAllBookingsComponent } from './admin-all-bookings/admin-all-bookings.component';
import { AdminBookIndivComponent } from './admin-book-indiv/admin-book-indiv.component';
import { AdminNavComponent } from './admin-nav/admin-nav.component';
import { AllBookingsComponent } from './all-bookings/all-bookings.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BookComponent } from './book/book.component';
import { LMCComponent } from './lmc/lmc.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { InviteComponent } from './invite/invite.component';
import { MessagesComponent } from './messages/messages.component';
import { BuddyListComponent } from './buddy-list/buddy-list.component';
import { MemberSearchComponent } from './member-search/member-search.component';
import { ImageCropperComponent } from './image-cropper/image-cropper.component';
import { MatNativeDateModule } from '@angular/material/core';

const appRoutes: Routes = [
  { path: 'Login', component: LoginComponent },
  { path: 'Book', component: BookComponent, canActivate: [AuthGuard] },
  { path: 'Buddy-List', component: BuddyListComponent, canActivate: [AuthGuard] },
  { path: 'LMC', component: BookComponent, canActivate: [AuthGuard] },
  { path: 'User/Edit', component: EditProfileComponent, canActivate: [AuthGuard] },
  { path: 'User/Messages', component: MessagesComponent, canActivate: [AuthGuard] },
  { path: 'Book/All', component: AllBookingsComponent, canActivate: [AuthGuard] },
  { path: 'Book/All/200', component: AllBookingsComponent, canActivate: [AuthGuard] },

  { path: 'Admin', component: AdminComponent, canActivate: [AdminGuard] },
  { path: 'Admin/Book/Group', component: AdminBookComponent, canActivate: [AdminGuard] },
  { path: 'Admin/Book/Indiv', component: AdminBookIndivComponent, canActivate: [AdminGuard] },
  { path: 'Admin/Book/All', component: AdminAllBookingsComponent, canActivate: [AdminGuard] },

  {path: '',
    redirectTo: 'Login',
    pathMatch: 'full',
  },
  { path: '**', component: PageNotFoundComponent },
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    FirstScreenComponent,
    HeaderComponent,
    FooterComponent,
    PageNotFoundComponent,
    AdminComponent,
    EditProfileComponent,
    AdminBookComponent,
    TeeTimesComponent,
    MemberCardComponent,
    AdminAllBookingsComponent,
    AdminBookIndivComponent,
    AdminNavComponent,
    AllBookingsComponent,
    BookComponent,
    NaturalType,
    LMCComponent,
    InviteComponent,
    MessagesComponent,
    BuddyListComponent,
    MemberSearchComponent,
    ImageCropperComponent
  ],
  entryComponents: [
    MemberCardComponent,
    TeeTimesComponent,
    MemberSearchComponent,
    ImageCropperComponent
  ],
  imports: [
    NgbModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatCheckboxModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSelectModule,
    MatBadgeModule,
    MatTooltipModule,
    MatButtonToggleModule,
    MatListModule,
    MatMenuModule,
    MatTabsModule,
    MatTreeModule,
    MatDatepickerModule,
    MatNativeDateModule,
    DragDropModule,
    RouterModule.forRoot(
      appRoutes
    ),
    BrowserAnimationsModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),

  ],
  providers: [
    HeaderService,
    AuthService,
    AdminGuard,
    AuthGuard,
    {provide: LocationStrategy, useClass: HashLocationStrategy}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
