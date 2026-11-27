
import openpyxl
from openpyxl.styles import Font, Alignment, Border, Side, Protection, PatternFill
from openpyxl.worksheet.datavalidation import DataValidation
f=Side(style='thin',color='000000'); B=Border(left=f,right=f,top=f,bottom=f)
def cells(ws, ref):
    r = ws[ref]
    if not isinstance(r, tuple): return [r]
    return [c for row in r for c in row]
def livre(ws, ref):
    for c in cells(ws, ref): c.protection=Protection(locked=False); c.border=B
def cx(ws, a, t, bold=False, size=11, al='left'):
    ws[a]=t; ws[a].font=Font(name='Arial',bold=bold,size=size); ws[a].alignment=Alignment(horizontal=al,vertical='center')
wb=openpyxl.Workbook(); ws=wb.active; ws.title='Ficha'
for col,w in zip('ABCDEF',[6,22,16,14,14,14]): ws.column_dimensions[col].width=w
ws.merge_cells('A1:F1'); cx(ws,'A1','CADEIA DE CUSTÓDIA DE AMOSTRAS (exemplo)',True,14,'center'); ws.row_dimensions[1].height=28
for r,rot in zip(range(3,7),['Fazenda','Talhão','Data da coleta','Coletor']):
    cx(ws,f'A{r}',rot,True); ws.merge_cells(f'A{r}:B{r}'); ws[f'A{r}'].border=B
    livre(ws,f'C{r}:F{r}'); ws.merge_cells(f'C{r}:F{r}'); ws.row_dimensions[r].height=22
ws['C5'].number_format='dd/mm/yyyy'
for col,t in zip('ABCDE',['Nº','Identificação','Material','Quantidade','Observação']):
    cx(ws,f'{col}8',t,True,11,'center'); ws[f'{col}8'].border=B; ws[f'{col}8'].fill=PatternFill('solid',fgColor='D9D9D9')
ws.merge_cells('E8:F8')
dv=DataValidation(type='list',formula1='"Solo,Folha,Fruta,Água"',allow_blank=True); ws.add_data_validation(dv)
for r in range(9,19):
    cx(ws,f'A{r}',r-8,False,11,'center'); ws[f'A{r}'].border=B
    livre(ws,f'B{r}:F{r}'); ws.merge_cells(f'E{r}:F{r}'); dv.add(f'C{r}'); ws.row_dimensions[r].height=22
cx(ws,'A19','Total',True); ws['D19']='=SUM(D9:D18)'; ws['D19'].border=B; ws['D19'].font=Font(name='Arial',bold=True)
cx(ws,'A22','Entregue por: ______________________'); cx(ws,'D22','Recebido por: ______________________')
ws.protection.sheet=True; ws.page_setup.orientation='portrait'; ws.page_setup.paperSize=9; ws.print_area='A1:F23'
ws2=wb.create_sheet('Instruções'); ws2['A1']='Esta aba não aparece no modo documento.'
wb.save('ficha.xlsx')
wb=openpyxl.Workbook(); ws=wb.active; ws.title='Etiquetas'
for col,w in zip('ABCDE',[14,30,4,14,30]): ws.column_dimensions[col].width=w
for bloco in range(3):
    for c1,c2 in [('A','B'),('D','E')]:
        r=1+bloco*6
        cx(ws,f'{c1}{r}','AMOSTRA (exemplo)',True,13,'center'); ws.merge_cells(f'{c1}{r}:{c2}{r}'); ws[f'{c1}{r}'].border=B; ws.row_dimensions[r].height=24
        for i,rot in enumerate(['Talhão','Análise','Data','Coletor']):
            cx(ws,f'{c1}{r+1+i}',rot,True); ws[f'{c1}{r+1+i}'].border=B; livre(ws,f'{c2}{r+1+i}'); ws.row_dimensions[r+1+i].height=24
ws.protection.sheet=True; ws.page_setup.orientation='landscape'; ws.page_setup.paperSize=9
wb.save('etiquetas.xlsx')
wb=openpyxl.Workbook(); ws=wb.active; ws.title='POP'; ws.column_dimensions['A'].width=70
for i,t in enumerate(['PROCEDIMENTO DE COLETA (exemplo)','1. Separar os sacos e as etiquetas.','2. Identificar cada amostra no campo.','3. Levar as amostras ao laboratório no mesmo dia.']): cx(ws,f'A{i+1}',t,i==0,12)
wb.save('pop.xlsx')
