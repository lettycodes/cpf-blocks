export interface Question {
    id?: string;
    question: string;
    alternatives: string[];
    answers: string[];
    type:string;
    category:string;
}