# Modelo de TESTE da água (regra do Elias de 27/11 14:00: marca d'água "MODELO NÃO OFICIAL · SÓ PARA TESTE"). Não é cadeia de ninguém:
# só uma grade com o nome de cada campo do Cwork ao lado da célula marcada, para provar o preenchimento. Não entra no app.
# As colunas "à mão" (frasco, nº de frascos, preservação) ficam liberadas e sem campo: o Elias escreve na folha aberta.
import openpyxl
from openpyxl.styles import Font, Border, Side, Protection
from openpyxl.workbook.defined_name import DefinedName
from openpyxl.drawing.image import Image as Img
B = Side(style='thin', color='999999'); BB = Border(left=B, right=B, top=B, bottom=B)
wb = openpyxl.Workbook(); ws = wb.active; ws.title = 'Teste'
for col, w in zip('ABCDEFGHIJ', [12, 18, 10, 7, 20, 14, 7, 14, 10, 10]): ws.column_dimensions[col].width = w
ws['A1'] = 'MODELO NÃO OFICIAL · SÓ PARA TESTE'; ws['A1'].font = Font(bold=True, size=12)
def campo(r, rot, chave):
    ws[f'A{r}'] = rot; ws[f'B{r}'].border = BB
    wb.defined_names['efc_' + chave] = DefinedName('efc_' + chave, attr_text=f"'Teste'!$B${r}")
campo(3, 'grupo.material', 'grupo_material'); campo(4, 'grupo.analise', 'grupo_analise'); campo(5, 'grupo.quantidade', 'grupo_quantidade')
campo(6, 'grupo.xagua', 'grupo_xagua'); campo(7, 'lab.nome', 'lab_nome'); campo(8, 'envio.data', 'envio_data')
cols = [('A', 'n'), ('B', 'identificacao'), ('C', 'data'), ('D', 'hora'), ('E', 'analise'), ('F', 'coletor'), ('G', 'os'), ('H', 'obs')]
for col, c in cols:
    ws[f'{col}10'] = 'amostras[].' + c; ws[f'{col}10'].font = Font(bold=True, size=8)
    for r in range(11, 19): ws[f'{col}{r}'].border = BB
    wb.defined_names['efc_amostras_' + c] = DefinedName('efc_amostras_' + c, attr_text=f"'Teste'!${col}$11:${col}$18")
for col, rot in [('I', 'à mão (1)'), ('J', 'à mão (2)')]:
    ws[f'{col}10'] = rot; ws[f'{col}10'].font = Font(bold=True, size=8)
    for r in range(11, 19): ws[f'{col}{r}'].border = BB; ws[f'{col}{r}'].protection = Protection(locked=False)
ws.protection.sheet = True
m = Img('marca-dagua-teste.png'); m.width, m.height = 520, 220; ws.add_image(m, 'C2')
ws.page_setup.orientation = 'landscape'; ws.page_setup.paperSize = 9; ws.print_area = 'A1:J19'
wb.save('teste-agua.xlsx')
