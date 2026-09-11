export function parseUnitEntry(search){
  const params=new URLSearchParams(search);
  const id=[1,2,3].includes(Number(params.get('unit')))?Number(params.get('unit')):1;
  const raw=params.get('count');
  const count=raw&&/^\d+$/.test(raw)?Number(raw):null;
  const valid=Number.isInteger(count)&&count>=1&&count<=120;
  return {id,count:valid?count:null,invalid:raw!==null&&!valid};
}
export const unitUrl=(id,count)=>`?unit=${id}${count===undefined?'':`&count=${count}`}`;
