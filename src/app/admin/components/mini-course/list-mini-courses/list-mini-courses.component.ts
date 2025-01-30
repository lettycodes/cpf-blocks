import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IsAdminGuard } from 'src/app/shared/guards/isAdmin/is-admin.guard';
import { MiniCurso } from 'src/app/shared/models/mini-curso';
import { AuthService } from 'src/app/shared/services/auth.service';
import { MiniCourseService } from 'src/app/shared/services/mini-course.service';
import { DeleteMiniCourseDialogComponent } from '../delete-mini-course-dialog/delete-mini-course-dialog.component';

@Component({
  selector: 'app-list-mini-courses',
  templateUrl: './list-mini-courses.component.html',
  styleUrls: ['./list-mini-courses.component.css']
})
export class ListMiniCoursesComponent implements OnInit {

  // isAdmin: boolean
  miniCursos: MiniCurso[] = [];
  loading: boolean = true;

  constructor(
    private miniCourseService: MiniCourseService,
    private modalService: NgbModal,
    private adminGuard: IsAdminGuard,
    public authService: AuthService
  ) { }

  openDelete(miniCurso: MiniCurso) {
    const modalRef = this.modalService.open(DeleteMiniCourseDialogComponent, { size: 'sm', centered: true });
    modalRef.componentInstance.miniCurso = miniCurso;
  }

  ngOnInit() {
    // this.adminGuard.isAuthorized(true).subscribe((boolean) => {
    //   this.isAdmin = boolean;
    // });

    this.miniCourseService.getAllMiniCursos()
      .subscribe(miniCursosFirestore => {

        this.miniCursos = miniCursosFirestore;
        this.loading = false

      });
  }

}
