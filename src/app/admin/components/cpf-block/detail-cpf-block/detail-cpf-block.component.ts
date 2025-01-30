import { Component, Input, OnInit } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { CpfBlockService } from "src/app/shared/services/cpf-block.service";

@Component({
  selector: "app-cpf-detail",
  templateUrl: "./detail-cpf-block.component.html",
  styleUrls: ["./detail-cpf-block.component.css"],
})
export class DetailCpfBlockComponent implements OnInit {
  @Input() public dados: any;
  public cpfDetails: any;

  constructor(
    public activeModal: NgbActiveModal,
    private cpfBlockService: CpfBlockService
  ) {}

  ngOnInit(): void {
    console.log(this.dados);
    this.loadCpfDetails();
  }

  loadCpfDetails() {
    this.cpfBlockService.getBlockFindByCpf(this.dados.cpf).subscribe(
      (data) => {
        if (data.length > 0) {
          this.cpfDetails = data[0];
        } else {
          console.log("Nenhum dado encontrado para este CPF");
        }
      },
      (error) => {
        console.error("Erro ao buscar detalhes do CPF:", error);
      }
    );
  }

  formatCpf(cpf: string): string {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }
}
