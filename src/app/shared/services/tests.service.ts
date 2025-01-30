import { Answers, Inscricao } from "./../models/inscricao";
import { Observable } from "rxjs";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { Injectable } from "@angular/core";
import { Question } from "../models/question";
import { AngularFireFunctions } from "@angular/fire/compat/functions";

@Injectable({
  providedIn: "root",
})
export class TestsService {
  constructor(
    private db: AngularFirestore,
    private aFF: AngularFireFunctions
  ) {}

  getQuestionTesteLogico(tipo: string): Observable<Question[]> {
    return this.db
      .collection("Question", (ref) =>
        ref
          .where("category", "==", "teste-logico")
          .where("bootcamp", "==", tipo)
      )
      .valueChanges() as Observable<Question[]>;
  }

  getQuestionTesteTecnico(tipo: string): Observable<Question[]> {
    return this.db
      .collection("Question", (ref) =>
        ref
          .where("category", "==", "teste-tecnico")
          .where("bootcamp", "==", tipo)
      )
      .valueChanges() as Observable<Question[]>;
  }

  getIsApproved(answerCandidate: string[], answerQuestion: string[]) {
    let approved: boolean = true;

    answerCandidate.forEach((resposta) => {
      if (answerQuestion.indexOf(resposta) != -1 && approved) {
        approved = true;
      } else {
        approved = false;
      }
    });
    return approved;
  }

  createAnswersObj(
    uidQuestao: string,
    gabaritoQuestao: string[],
    respCandidato: string[]
  ): Answers {
    return {
      uidQuestao: uidQuestao,
      gabaritoQuestao: gabaritoQuestao,
      respCandidato: respCandidato,
      estaCorreta: this.getIsApproved(respCandidato, gabaritoQuestao),
    };
  }

  getUserUid(uidUsuario: string): Observable<Inscricao[]> {
    return this.db
      .collection("Inscricao", (ref) =>
        ref.where("uidUsuario", "==", uidUsuario)
      )
      .valueChanges() as Observable<Inscricao[]>;
  }

  getUidInscricao(uidInscricao: string) {
    return this.db.collection("Inscricao").doc(uidInscricao);
  }

  calcularMediaLogica(data: any) {
    return this.aFF.httpsCallable("calculaMediaLogico")(data);
  }

  calcularMediaTecnico(data: any) {
    return this.aFF.httpsCallable("calculaMediaTecnico")(data);
  }

  getTipoBootcamp(tipo: string) {
    return this.db
      .collection("TiposBootcamp", (ref) => ref.where("tipo", "==", tipo))
      .valueChanges();
  }
}
