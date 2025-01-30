import { Component, OnInit } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { HotToastService } from "@ngneat/hot-toast";
import { CreateCpfBlockComponent } from "../create-cpf-block/create-cpf-block.component";
import { DeleteCpfBlockComponent } from "../delete-cpf-block/delete-cpf-block.component";
import { DetailCpfBlockComponent } from "../detail-cpf-block/detail-cpf-block.component";
import { UpdateCpfBlockComponent } from "../update-cpf-block/update-cpf-block.component";
import { Block } from "src/app/shared/models/block";
import { Observable } from "rxjs";
import { CpfBlockService } from "src/app/shared/services/cpf-block.service";

@Component({
  selector: "app-cpf-list",
  templateUrl: "./list-cpf-block.component.html",
  styleUrls: ["./list-cpf-block.component.css"],
})
export class ListCpfBlockComponent implements OnInit {
  allCpfs$: Observable<Block[]>;
  listaBlock: Block[] = [];
  listCpfsToSearch: Block[] = [];

  public textSearch: string = "";
  public page = 1;
  public pageSize = 5;
  public listPage = [5, 10, 15, 20];

  order: string = "cpf";
  reverse: boolean = true;
  caseInsensitive: boolean = false;
  titulo = "Candidatos Bloqueados";
  disabled: boolean = false;
  loading: boolean = false;

  motivos: string[] = ['Reprovado pela 1ª vez (Pitch)', 'Reprovado pela 2ª vez (Pitch)', 'Outros'];
  listaStatus: string[] = ['Alerta', 'Bloqueado automaticamente', 'Liberado'];

  constructor(
    private cpfBlockService: CpfBlockService,
    private modalService: NgbModal,
    private toast: HotToastService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.allCpfs$ = this.cpfBlockService.getBlockFindAll();
    this.allCpfs$.subscribe((blockData) => {
      this.listaBlock = blockData;
      this.listCpfsToSearch = blockData;
      this.loading = false;
    });
  }

  filterList() {
    if (this.textSearch.length > 2) {
      this.listaBlock = this.listCpfsToSearch.filter(
        (item) =>
          item.cpf
            .toString()
            .toLowerCase()
            .indexOf(this.textSearch.toLowerCase()) > -1 ||
          item.nomeCompleto
            .toString()
            .toLowerCase()
            .indexOf(this.textSearch.toLowerCase()) > -1 ||
          item.status
            .toString()
            .toLowerCase()
            .indexOf(this.textSearch.toLowerCase()) > -1
      );
    } else {
      this.listaBlock = this.listCpfsToSearch;
    }
  }

  setOrder(value: string) {
    if (this.order === value) {
      this.reverse = !this.reverse;
    }
    this.order = value;
  }

  refreshList() {
    this.listaBlock = this.listaBlock
      .map((block, i) => ({ id: i + 1, ...block }))
      .slice(
        (this.page - 1) * this.pageSize,
        (this.page - 1) * this.pageSize + this.pageSize
      );
  }

  refreshBlock() {
    this.loading = true;
    this.allCpfs$ = this.cpfBlockService.getBlockFindAll();
    this.allCpfs$.subscribe((data) => {
      this.listaBlock = data;
      this.listCpfsToSearch = data;
      this.loading = false;
    });
  }

  changeDisabled() {
    this.disabled
      ? (this.titulo = "CPFs Cadastrados")
      : (this.titulo = "CPFs Desabilitados");
    this.disabled = !this.disabled;

    this.refreshBlock();
  }

  onClickCreate() {
    const ref = this.modalService.open(CreateCpfBlockComponent, {
      centered: true,
    });
    ref.closed.subscribe({
      next: async (result) => {
        if (result) {
          await this.cpfBlockService.createBlockList(result);
          this.refreshBlock();
        }
      },
    });
  }

  onClickDetail(cpf: Block) {
    const ref = this.modalService.open(DetailCpfBlockComponent, {
      centered: true,
    });
    ref.componentInstance.dados = cpf;
  }

  async onClickEdit(blockData: Block) {
    const ref = this.modalService.open(UpdateCpfBlockComponent, {
      centered: true,
    });

    ref.componentInstance.blockData = blockData;

    ref.closed.subscribe({
      next: async (result) => {
        if (result === "CPF atualizado com sucesso!") {
          this.refreshBlock();
          this.toast.success("CPF atualizado com sucesso!");
        }
      },
      error: () => {
        this.toast.warning("Edição cancelada.");
      },
    });
  }

  onClickDelete(cpf: Block) {
    const ref = this.modalService.open(DeleteCpfBlockComponent, {
      centered: true,
    });
    ref.componentInstance.dados = cpf;
    ref.closed.subscribe({
      next: (result) => {
        if (result) {
          this.cpfBlockService.deleteBlockList(result);
          this.refreshBlock();
        }
      },
    });
  }

  onClickAdd() {
    this.onClickCreate();
  }

  formatCpf(cpf: string): string {
    return cpf
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }
}
