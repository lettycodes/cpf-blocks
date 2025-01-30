import { Component, OnInit } from '@angular/core';
import { IsRecruiterGuard } from '../../guards/isRecruiter/is-recruiter.guard';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  // isRecruiter: boolean = this.recruiterGuard.isRecruiter;

  constructor(
    private recruiterGuard: IsRecruiterGuard,
    public authService: AuthService
  ) { }

  ngOnInit(): void {
    // this.recruiterGuard.isAthorized().subscribe(res => {
    //   this.isRecruiter = res;
    // })
  }

}
