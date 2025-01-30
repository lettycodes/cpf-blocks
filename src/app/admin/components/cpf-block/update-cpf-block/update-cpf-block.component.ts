import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Block } from 'src/app/shared/models/block';
import { CpfBlockService } from 'src/app/shared/services/cpf-block.service';
import { HotToastService } from '@ngneat/hot-toast';

@Component({
  selector: 'app-cpf-update',
  templateUrl: './update-cpf-block.component.html',
  styleUrls: ['./update-cpf-block.component.css']
})
export class UpdateCpfBlockComponent implements OnInit {
  updateBlockForm: FormGroup;
  motivos: string[] = ['Reprovado pela 1ª vez (Pitch)', 'Reprovado pela 2ª vez (Pitch)', 'Outros'];
  listaStatus: string[] = ['Alerta', 'Bloqueado automaticamente', 'Liberado'];
  blockData: Block;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private cpfBlockService: CpfBlockService,
    private toast: HotToastService
  ) {}

  ngOnInit(): void {
    this.initForm();
    if (this.blockData) {
      this.updateBlockForm.patchValue(this.blockData);
    }
  }

  initForm(): void {
    this.updateBlockForm = this.fb.group({
      cpf: ['', [Validators.required, this.validateCpf]],
      email: ['', [Validators.required, Validators.email]],
      nomeCompleto: ['', [Validators.required, Validators.minLength(5)]],
      motivo: ['', Validators.required],
      status: ['', Validators.required],
      comentario: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  validateCpf(control) {
    const cpf = control.value.replace(/\D/g, '');
    return cpf.length === 11 ? null : { invalidCpf: true };
  }

  get cpf() {
    return this.updateBlockForm.get('cpf');
  }

  get email() {
    return this.updateBlockForm.get('email');
  }

  get nomeCompleto() {
    return this.updateBlockForm.get('nomeCompleto');
  }

  get motivo() {
    return this.updateBlockForm.get('motivo');
  }

  get status() {
    return this.updateBlockForm.get('status');
  }

  get comentario() {
    return this.updateBlockForm.get('comentario');
  }

  onSubmit(): void {
    if (this.updateBlockForm.invalid) {
      return;
    }

    const updatedBlock: Block = {
      ...this.blockData,
      cpf: this.cpf.value,
      email: this.email.value,
      nomeCompleto: this.nomeCompleto.value,
      motivo: this.motivo.value,
      status: this.status.value,
      comentario: this.comentario.value
    };

    this.cpfBlockService.updateBlockList(updatedBlock).subscribe(() => {
      this.activeModal.close();
      this.toast.success("CPF Block atualizado com sucesso!");
    });
  }
}
