export function createUnitLessons(base,count) {
  if(!Number.isInteger(count)||count<1||count>120)throw new RangeError('Elige una cantidad entera entre 1 y 120.');
  const principal=base.challenges.filter(c=>!c.optional);
  const bank=principal.slice(0,-1),final=principal.at(-1);
  const questions={};
  const copy=(source,id,cycle=0)=>{
    const question=base.questions[source.id];
    questions[id]=[question[0],[...question[1]],question[2],question[3]];
    return {...source,id,title:source.title+(cycle?` · Práctica ${cycle+1}`:'')};
  };
  const challenges=Array.from({length:count},(_,i)=>copy(i===count-1?final:bank[i%bank.length],i+1,i===count-1?0:Math.floor(i/bank.length)));
  challenges.push(copy(base.challenges.find(c=>c.optional&&!c.recovery),count+1),copy(base.challenges.find(c=>c.recovery),count+2));
  return {mainCount:count,challenges,questions};
}
