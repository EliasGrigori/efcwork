# v0.6.81 (Vértice): o mesmo modelo de TESTE da v0.6.45 com uma aba "Instruções (exemplo)" ANTES da aba dos campos, para provar que o pedido
# imprime só a aba com campos do Cwork. Modelo de TESTE (regra do Elias de 27/11 14:00: marca d'água "MODELO NÃO OFICIAL · SÓ PARA TESTE"). Não é ficha de ninguém:
# só uma grade com o nome de cada campo do Cwork ao lado da célula marcada, para provar o preenchimento. Não entra no app.
import openpyxl
from openpyxl.styles import Font, Border, Side, Protection
from openpyxl.workbook.defined_name import DefinedName
from openpyxl.drawing.image import Image as Img
B = Side(style='thin', color='999999'); BB = Border(left=B, right=B, top=B, bottom=B)
wb = openpyxl.Workbook(); wi = wb.active; wi.title = 'Instruções (exemplo)'
wi['A1'] = 'MODELO NÃO OFICIAL · SÓ PARA TESTE'; wi['A1'].font = Font(bold=True, size=12); wi['A3'] = 'Aba de instruções (exemplo): não deve sair no pedido do Cwork.'
mi = Img('marca-dagua-teste.png'); mi.width, mi.height = 520, 220; wi.add_image(mi, 'B5')
ws = wb.create_sheet('Teste')
for col, w in zip('ABCDEFGH', [16, 22, 12, 12, 26, 14, 12, 18]): ws.column_dimensions[col].width = w
ws['A1'] = 'MODELO NÃO OFICIAL · SÓ PARA TESTE'; ws['A1'].font = Font(bold=True, size=12)
def campo(r, rot, chave):
    ws[f'A{r}'] = rot; ws[f'B{r}'].border = BB
    wb.defined_names['efc_' + chave] = DefinedName('efc_' + chave, attr_text=f"'Teste'!$B${r}")
campo(3, 'grupo.material', 'grupo_material'); campo(4, 'grupo.analise', 'grupo_analise'); campo(5, 'grupo.quantidade', 'grupo_quantidade')
campo(6, 'grupo.xsolo', 'grupo_xsolo'); campo(7, 'grupo.xfolha', 'grupo_xfolha'); campo(8, 'lab.nome', 'lab_nome')
cols = [('A', 'n'), ('B', 'identificacao'), ('C', 'data'), ('D', 'hora'), ('E', 'analise'), ('F', 'profundidade'), ('G', 'material'), ('H', 'obs')]
for col, c in cols:
    ws[f'{col}10'] = 'amostras[].' + c; ws[f'{col}10'].font = Font(bold=True, size=8)
    for r in range(11, 19): ws[f'{col}{r}'].border = BB
    wb.defined_names['efc_amostras_' + c] = DefinedName('efc_amostras_' + c, attr_text=f"'Teste'!${col}$11:${col}$18")
for r in range(20, 22):
    ws[f'A{r}'] = 'à mão' if r == 20 else ''; ws[f'B{r}'].border = BB; ws[f'B{r}'].protection = Protection(locked=False)
ws.protection.sheet = True
m = Img('marca-dagua-teste.png'); m.width, m.height = 520, 220; ws.add_image(m, 'C2')
ws.page_setup.orientation = 'landscape'; ws.page_setup.paperSize = 9; ws.print_area = 'A1:H21'
wb.save('teste-duas-abas.xlsx')
