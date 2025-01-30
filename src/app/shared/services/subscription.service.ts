import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { Block } from '../models/block';
import { Inscricao } from '../models/inscricao';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {

constructor(private db : AngularFirestore) { }

getUserByCpf(cpf: string) {
  return this.db.collection('CPFBlock', ref => ref.where('cpf', '==', cpf).where('bloqueado','==', true)).valueChanges() as Observable<Block[]>
  }
  
getUserByEmail(email: string) {
 return this.db.collection('Inscricao', ref => ref.where('email', '==', email)).valueChanges() as Observable<Inscricao[]>
}

}
