import { Injectable } from '@angular/core';
// import {  } from '../models/curso';
// import { detalhesDosCursos } from '../options';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { from, Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import { Inscricao } from '../models/inscricao';
import { ProcessoNuvem, Processo } from '../models/curso';

@Injectable({
  providedIn: 'root'
})
export class CoursesService {

  constructor(
    private db: AngularFirestore
  ) { }


  convertToDateFromFirestore(dateFirestore: Date): Date {
    let dateSplitted = dateFirestore.toString().split(',');
    dateSplitted = dateSplitted[0].split('=');
    let date: Date = new Date(+dateSplitted[1] * 1000);

    return date;
  }

  getProcessById(id: string): Observable<Processo> {
    return this.db.collection('Processos').doc(id).valueChanges()
      .pipe(
        tap((processo: Processo) => {
          processo.inicioBootcamp = this.convertToDateFromFirestore(processo.inicioBootcamp);
          processo.inicioInscricoes = this.convertToDateFromFirestore(processo.inicioInscricoes);
          processo.terminoInscricoes = this.convertToDateFromFirestore(processo.terminoInscricoes);
        })
      )
  }

  getAllProcesses(): Observable<Processo[]> {
    return this.db.collection('Processos')
      .valueChanges()
      .pipe(
        tap((processos: Processo[]) => {
          processos.forEach((processo: Processo) => {
            processo.inicioBootcamp = this.convertToDateFromFirestore(processo.inicioBootcamp);
            processo.inicioInscricoes = this.convertToDateFromFirestore(processo.inicioInscricoes);
            processo.terminoInscricoes = this.convertToDateFromFirestore(processo.terminoInscricoes);
          })
        })
      )
  }

  getProcessesFilteredByStatus(status: string): Observable<Processo[]> {
    return this.db.collection('Processos', ref => {

      return ref
        .where('status', '==', status)
    }).valueChanges()
      .pipe(
        tap((processos: Processo[]) => {
          processos.forEach((processo: Processo) => {
            processo.inicioBootcamp = this.convertToDateFromFirestore(processo.inicioBootcamp);
            processo.inicioInscricoes = this.convertToDateFromFirestore(processo.inicioInscricoes);
            processo.terminoInscricoes = this.convertToDateFromFirestore(processo.terminoInscricoes);
          })
        })
      )
  }

  getProcessesAguardandoInicioEAtivos(): Observable<Processo[]> {
    return this.db.collection('Processos', ref => {

      return ref
        .where('status', '!=', 'Encerrado')
    }).valueChanges()
      .pipe(
        tap((processos: Processo[]) => {
          processos.forEach((processo: Processo) => {
            processo.inicioBootcamp = this.convertToDateFromFirestore(processo.inicioBootcamp);
            processo.inicioInscricoes = this.convertToDateFromFirestore(processo.inicioInscricoes);
            processo.terminoInscricoes = this.convertToDateFromFirestore(processo.terminoInscricoes);
          })
        })
      )
  }

  getProcessesFilteredByTipo(tipo: string): Observable<Processo[]> {
    return this.db.collection('Processos', ref => {

      return ref
        .where('tipo', '==', tipo)
    })
      .valueChanges()
      .pipe(
        tap((processos: Processo[]) => {
          processos.forEach((processo: Processo) => {
            processo.inicioBootcamp = this.convertToDateFromFirestore(processo.inicioBootcamp);
            processo.inicioInscricoes = this.convertToDateFromFirestore(processo.inicioInscricoes);
            processo.terminoInscricoes = this.convertToDateFromFirestore(processo.terminoInscricoes);
          })
        })
      )
  }

  getInscritosOfProcess(id: string): Observable<Inscricao[]>{
    return this.db.collection('Inscricao', ref => ref.where('processoUid', '==', id)).valueChanges() as Observable<Inscricao[]>;
  }

  returnProcessStatusBasedOnDate(inicioInscricoes: Date, terminoInscricoes: Date): string {
    const currentDate = new Date();

    if (inicioInscricoes.setHours(0, 0, 0, 0) > currentDate.setHours(0, 0, 0, 0)) {
      return 'Aguardando Início';
    } else if (inicioInscricoes.setHours(0, 0, 0, 0) <= currentDate.setHours(0, 0, 0, 0) && terminoInscricoes.setHours(0, 0, 0, 0) > currentDate.setHours(0, 0, 0, 0)) {
      return 'Ativo';
    } else {
      return 'Encerrado';
    }

  }

  createProcess(process: Processo): Observable<void> {
    return from(this.db.collection('Processos').add(process)
      .then((docRef) => {
        docRef.update({ id: docRef.id });
        process.id = docRef.id;
      }))
  }

  updateProcess(process: Processo): Observable<void> {
    return from(this.db.collection('Processos').doc(process.id).update(process));
  }

  updateInscritosOfProcess(inscrito: Inscricao){
    return from(this.db.collection('Inscricao').doc(inscrito.uid).update(inscrito));
  }

  deleteProcess(id: string): Observable<void> {
    return from(this.db.collection('Processos').doc(id).delete());
  }

  verififyIfAnotherProcessHasSameType(processes: Processo[], tipo: string) {
    if (processes.find((processFromArray) => processFromArray.tipo == tipo) != undefined) {
      return true;
    }
    return false;
  }

  formatarNomeDoCurso(curso: string): string { // transforma a url do curso "inscricao-nome-do-curso" em "Nome Do Curso"
    return curso.replace(/-/g, ' ').replace(/\w\S*/g, (txt) => { // substitui todos os caracteres que não sejam letras ou espaços por espaços
      if (txt == 'inscricao' || txt == 'curso' || txt == 'enviar' || txt == 'video') return '';
      return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
    });
  }

  /**
   * @param curso nome do curso
   * @returns detalhes do curso contidos no arquivo shared/options.ts
   */

  // detalhesDoCurso(curso: string): Processo {
  //   return detalhesDosCursos.find(cursoEncontrado => cursoEncontrado.tipo === curso.trim());
  // }

  formatarCurso(curso: string): string {
    let curs = curso.trim();
    return curs.replace(/ /g, "-").toLowerCase();
  }

  detalhesDoCursoFire(curso: string): Observable<Processo> {
    return this.db
      .collection<Processo>("Processos", (ref) => ref.where("tipo", "==", curso.trim()))
      .snapshotChanges()
      .pipe(
        map((snapshots) => {
          // 'find' encontra o primeiro resultado que satisfaz a condição ou undefined se não encontrar nenhum resultado
         const ativo = snapshots.find(snapshot => snapshot.payload.doc.data().status === 'Ativo');
          if (ativo) {
            return {
              id: ativo.payload.doc.id,
              ...ativo.payload.doc.data()
            }
          } else {
            // retorna o item 0 do array de processos que não estão ativos
            return {
              id: snapshots[0].payload.doc.id,
              ...snapshots[0].payload.doc.data()
            }
          }
        })
      );


      
      
        
        
      //     return snapshots.map((doc) => {
      //      return {
      //         id: doc.payload.doc.id,
      //         ...doc.payload.doc.data()
      //      } as Processo;
      //     });
      //   })
      // );
  }

  getTipoBootcamp(tipo: string) {
    return this.db
      .collection("TiposBootcamp", (ref) => ref.where("tipo", "==", tipo))
      .valueChanges();
  }

  getMiniCurso(titulo:string)  {
    return this.db
    .collection("MiniCursos", (ref) => ref.where("titulo", "==", titulo))
    .valueChanges();
  }

  
  getUserUid(uidUsuario: string): Observable<Inscricao[]> {
    return this.db
      .collection("Inscricao", (ref) =>
        ref.where("uidUsuario", "==", uidUsuario)
      )
      .valueChanges() as Observable<Inscricao[]>;
  }

  getInscricaoUid(uid: string) {
    return from(
      this.db
        .collection("Inscricao", (ref) => ref.where("uid", "==", uid))
        .valueChanges()
    ) as Observable<Inscricao[]>;
  }

  // detalhesDoCursoFireAtivo(curso: string) {
  //   return this.db
  //     .collection<Processo>("Processos", (ref) =>
  //       ref.where("tipo", "==", curso.trim()).where("status", "==", "Ativo")
  //     )
  //     .snapshotChanges()
  //     .pipe(
  //       map((snapshots) => {
  //         return snapshots.map((doc) => {
  //          return {
  //             id: doc.payload.doc.id,
  //             ...doc.payload.doc.data()
  //          } as Processo;
  //         });
  //       })
  //     );       
  // }

  detalhesDoCursoFireAtivo(curso: string) {
    return from(this.db
.collection("Processos", (a) => a.where("tipo", "==", curso.trim()).where("status", "==", 'Ativo')).snapshotChanges())
  }

}
