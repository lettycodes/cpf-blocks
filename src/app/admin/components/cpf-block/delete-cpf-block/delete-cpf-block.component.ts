import { Component, OnInit, Input } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { CpfBlockService } from "src/app/shared/services/cpf-block.service";
import { HotToastService } from '@ngneat/hot-toast';

@Component({
  selector: "app-cpf-delete",
  templateUrl: "./delete-cpf-block.component.html",
  styleUrls: ["./delete-cpf-block.component.css"],
})
export class DeleteCpfBlockComponent implements OnInit {
  @Input() dados: any;

  constructor(
    private cpfBlockService: CpfBlockService,
    public activeModal: NgbActiveModal,
    private toast: HotToastService
  ) {}

  ngOnInit(): void {}

  formatCpf(cpf: string): string {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }

  async onSubmit() {
    try {
      await this.cpfBlockService.deleteBlockList(this.dados);

      this.activeModal.close({ cpfDeletado: this.dados });
      this.toast.success('CPF Block deletado com sucesso!');
    } catch (error) {
      console.error("Erro ao deletar CPF:", error);
      this.toast.error('Erro ao criar novo CPF Block!');
    }
  }
}
