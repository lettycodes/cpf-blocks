import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CpfBlockService } from 'src/app/shared/services/cpf-block.service';
import { HotToastService } from '@ngneat/hot-toast';


@Component({
  selector: "app-cpf-create",
  templateUrl: "./create-cpf-block.component.html",
  styleUrls: ["./create-cpf-block.component.css"],
})
export class CreateCpfBlockComponent implements OnInit {

  motivos: string[] = ['Reprovado pela 1ª vez (Pitch)', 'Reprovado pela 2ª vez (Pitch)', 'Outros'];
  listaStatus: string[] = ['Alerta', 'Bloqueado automaticamente', 'Liberado'];

  constructor(
    private fb: FormBuilder,
    private cpfBlockService: CpfBlockService,
    public activeModal: NgbActiveModal,
    private toast: HotToastService
  ) {}

  createBlockForm = this.fb.group({
    cpf: ['', [Validators.required, this.validateCpf]],
    email: ['', [Validators.required, Validators.email]],
    nomeCompleto: ['', [Validators.required, Validators.minLength(5)]],
    motivo: ['', Validators.required],
    status: ['', Validators.required],
    comentario: ['', [Validators.required, Validators.minLength(5)]],
  });

  get cpf() {
    return this.createBlockForm.get('cpf');
  }

  get email() {
    return this.createBlockForm.get('email');
  }

  get nomeCompleto() {
    return this.createBlockForm.get('nomeCompleto');
  }

  get motivo() {
    return this.createBlockForm.get('motivo');
  }

  get comentario() {
    return this.createBlockForm.get('comentario');
  }

  get status() {
    return this.createBlockForm.get('status');
  }

  validateCpf(control: any): { [key: string]: boolean } | null {
    const cpfValue = control.value.replace(/\D/g, '');
    const cpfPattern = /^\d{11}$/;
    return cpfPattern.test(cpfValue) ? null : { invalidCpf: true };
  }

  async onSubmit() {
    if (this.createBlockForm.valid) {
      const { cpf, email, nomeCompleto, motivo, status, comentario } = this.createBlockForm.value;

      try {
        await this.cpfBlockService.createBlockList({
          cpf,
          email,
          nomeCompleto,
          motivo,
          status,
          comentario,
          bloqueado: false,
          contador: 0,
          id: null,
        }).toPromise();

        this.toast.success('CPF Block criado com sucesso!');
        this.activeModal.close();

      } catch (error) {
        console.error('Erro ao adicionar o CPF:', error);

        this.toast.error('Erro ao criar novo CPF Block!');
      }
    } else {
      this.toast.error('Por favor, corrija os erros do formulário antes de enviar.');
    }
  }

  ngOnInit(): void {}
}
