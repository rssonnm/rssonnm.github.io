---
title: "Thống kê cơ bản cho khoa học sự sống — Phần 3: Phân phối mẫu và định lý giới hạn trung tâm"
date: 2026-08-10T12:00:00
description: "Vì sao một mẫu nhỏ vài chục phép đo lại cho phép kết luận về một quần thể vô hạn? Câu trả lời nằm ở phân phối mẫu: bản thân trung bình mẫu là một biến ngẫu nhiên có phân phối biết trước. Bài viết xây dựng phân phối mẫu của trung bình, phương sai, tỉ lệ và hiệu hai trung bình; trình bày định lý giới hạn trung tâm với chặn Berry–Esseen; rồi ghép thành chuỗi suy luận hoàn chỉnh — từ mẫu đến khoảng tin cậy và kiểm định."
topic: mathematics
tags: [statistics, sampling-distribution, central-limit-theorem, standard-error, inference, tutorial]
featured: false
draft: false
---

Phần 2 đã xây nền móng xác suất: dữ liệu là thực hoá của biến ngẫu nhiên, trung bình mẫu $\bar{x}$ ước lượng kỳ vọng $E[X]$ nhờ định lý số lớn. Nhưng "ước lượng" mới chỉ là một con số — câu hỏi quyết định của suy luận thống kê là: **ước lượng đó chính xác đến mức nào?** Làm sao biết $\bar{x} = 42{,}23$ gần $\mu$ đến đâu khi chỉ đo sáu lần?

Câu trả lời, và cũng là chủ đề của Phần 3: bản thân $\bar{x}$ là một biến ngẫu nhiên, và **phân phối của nó** — gọi là phân phối mẫu (sampling distribution) — ta biết được gần như hoàn toàn. Định lý giới hạn trung tâm (CLT) cho biết phân phối đó có hình dạng gì; phân phối $t$, $\chi^2$ cho biết nó chính xác ra sao khi $\sigma$ phải ước lượng. Ghép lại, ta có câu trả lời đầy đủ cho câu hỏi của phần này: *vì sao có thể suy luận từ mẫu*.

## Phần A — Phân phối mẫu (sampling distribution)

### Thống kê mẫu là một biến ngẫu nhiên

```definition[Thống kê mẫu và phân phối mẫu]
Một **thống kê mẫu (statistic)** là bất kỳ con số nào tính từ mẫu — trung bình $\bar{x}$, phương sai $s^2$, tỉ lệ $\hat{p}$. Vì mẫu là ngẫu nhiên, thống kê mẫu là một **biến ngẫu nhiên**. **Phân phối mẫu (sampling distribution)** của một thống kê là phân phối của nó trên mọi mẫu có thể rút ra từ quần thể.
```

Đây là bước nhảy khái niệm quan trọng nhất của cả loạt bài. Từ Phần 2 ta đã quen: một phép đo là biến ngẫu nhiên. Giờ phải thêm một tầng nữa: *trung bình của các phép đo* cũng là biến ngẫu nhiên — vì mẫu bạn rút ra là ngẫu nhiên. Làm thí nghiệm lại từ đầu, bạn được $\bar{x}$ khác; làm lại n lần, bạn có n giá trị $\bar{x}$ khác nhau, và chúng phân tán theo một phân phối riêng — hẹp hơn phân phối của từng phép đo.

```example[Lặp lại cả thí nghiệm, không phải lặp lại phép đo]
Bạn đo IC50 của một hợp chất bằng ba giếng độc lập, lấy trung bình được $\bar{x}_1$. Tuần sau làm lại toàn bộ thí nghiệm từ đầu (pha mới, đĩa mới), được $\bar{x}_2$. Các giá trị $\bar{x}_1, \bar{x}_2, \dots$ dao động quanh IC50 thật — nhưng ít hơn nhiều so với từng phép đo đơn lẻ. Sự thu hẹp đó chính là nội dung của phần tiếp theo.
```

### Phân phối mẫu của trung bình

```lemma[Phân phối mẫu của $\bar{X}$]
Cho $X_1, \dots, X_n$ độc lập, cùng phân phối với kỳ vọng $\mu$ và phương sai $\sigma^2$. Khi đó
$$E[\bar{X}] = \mu, \qquad \operatorname{Var}(\bar{X}) = \frac{\sigma^2}{n}, \qquad \operatorname{SD}(\bar{X}) = \frac{\sigma}{\sqrt{n}}.$$
```

```proof
Kỳ vọng: $E[\bar{X}] = \frac{1}{n}E[X_1 + \cdots + X_n] = \frac{1}{n}(n\mu) = \mu$ — trung bình mẫu không chệch: "nhắm" đúng $\mu$, không lệch hệ thống.

Phương sai: vì các $X_i$ độc lập nên phương sai của tổng là tổng các phương sai, và hằng số $1/n$ ra ngoài với bình phương:
$$\operatorname{Var}(\bar{X}) = \operatorname{Var}\left(\frac{1}{n}\sum_i X_i\right) = \frac{1}{n^2}\sum_i \operatorname{Var}(X_i) = \frac{1}{n^2}\cdot n\sigma^2 = \frac{\sigma^2}{n}.$$
```

Hai kết luận đáng nhớ: (1) tâm của phân phối mẫu **đúng bằng** tham số cần ước lượng — trung bình mẫu không bị lệch; (2) độ phân tán của phân phối mẫu thu hẹp theo $1/\sqrt{n}$ — đây chính là **sai số chuẩn (standard error, SE)** mà Phần 1 gọi là SEM = s/√n: giờ đã rõ nó là *độ lệch chuẩn của phân phối mẫu của trung bình*.

<figure style="margin:1.8em 0;"><img src="/img/stats/sampling-dist.svg" alt="Phân phối mẫu của trung bình" style="display:block;width:100%;max-width:620px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Hình 1 — Quần thể (đường xám) và phân phối mẫu của trung bình với n = 4, 16, 64. Mọi phân phối mẫu đều cùng tâm μ; chỉ độ phân tán thu hẹp theo σ/√n. Đây là bức tranh lý thuyết của "đo nhiều lần thì trung bình càng chắc chắn".</figcaption></figure>

```example[Độ chính xác của ước lượng nồng độ glucose]
Giả sử nồng độ glucose huyết tương của một lô chuột có độ lệch chuẩn quần thể σ = 8 mg/dL. Với n = 9 con: $\operatorname{SD}(\bar{X}) = 8/\sqrt{9} = 2{,}67$ mg/dL. Với n = 36 con: $8/\sqrt{36} = 1{,}33$ mg/dL — gấp 4 lần mẫu, sai số chuẩn giảm một nửa. Lưu ý: σ của *từng con chuột* vẫn là 8 mg/dL; cái thu hẹp là độ chắc chắn của *trung bình*, không phải độ phân tán của dữ liệu.

Tính tiếp ra khoảng tin cậy: đo n = 9 con được $\bar{x} = 105$ mg/dL và $s = 8$ mg/dL (giờ là độ lệch chuẩn mẫu). Sai số chuẩn $SE = s/\sqrt{n} = 8/3 = 2{,}67$; khoảng 95% dùng $t_{0{,}975}(8) = 2{,}306$ (bảng $t$ ở Phần 1):
$$105 \pm 2{,}306 \times 2{,}67 = 105 \pm 6{,}2 \quad\Rightarrow\quad [98{,}9;\ 111{,}2]\ \text{mg/dL}.$$
Với n = 36 (giữ nguyên $\bar{x} = 105$, $s = 8$): $SE = 8/6 = 1{,}33$, $t_{0{,}975}(35) = 2{,}030$, khoảng $105 \pm 2{,}7$ — bề rộng [102,3; 107,7] chưa bằng một nửa, đúng hứa hẹn $1/\sqrt{n}$: gấp 4 lần n thì bề rộng khoảng chia đôi.
```

### Phân phối mẫu của phương sai

Trung bình mẫu không phải thống kê duy nhất có phân phối biết trước. Với dữ liệu chuẩn, phương sai mẫu cũng vậy — và phân phối của nó quan trọng không kém, vì nó giải thích vì sao ta cần phân phối $t$:

```lemma[Phân phối mẫu của phương sai]
Nếu $X_1, \dots, X_n$ độc lập, cùng phân phối $\mathcal{N}(\mu, \sigma^2)$, thì
$$\frac{(n-1)s^2}{\sigma^2} \sim \chi^2(n-1),$$
trong đó $\chi^2(k)$ là phân phối chi bình phương với $k$ bậc tự do. Hệ quả:
$$E[s^2] = \sigma^2, \qquad \operatorname{Var}(s^2) = \frac{2\sigma^4}{n-1}.$$
```

Kết quả này do Helmert tìm ra năm 1876 [^3]. Hai hệ quả đáng chú ý: (1) $E[s^2] = \sigma^2$ — đây chính là lý do hiệu chỉnh Bessel ở Phần 1; (2) phương sai của $s^2$ giảm như $1/(n-1)$ — chậm hơn hẳn $1/n$ của trung bình, nghĩa là **ước lượng độ phân tán hội tụ chậm hơn ước lượng vị trí**. Với n nhỏ, $s^2$ có thể lệch khỏi $\sigma^2$ một khoảng rất lớn — và sự bất định đó phải được "tính vào" khi suy luận về $\mu$.

<figure style="margin:1.8em 0;"><img src="/img/stats/chi2.svg" alt="Phân phối chi bình phương" style="display:block;width:100%;max-width:620px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Hình 2 — Phân phối χ² với bậc tự do 1, 2, 5, 10 — phân phối mẫu của (n−1)s²/σ². Bậc tự do nhỏ (mẫu nhỏ): lệch mạnh, đuôi trái dài — s² hay đánh giá thấp σ². Bậc tự do lớn: xấp xỉ chuẩn, như CLT dự đoán.</figcaption></figure>

### Phân phối mẫu của tỉ lệ và của hiệu hai trung bình

Hai thống kê khác xuất hiện thường xuyên trong thực hành:

- **Tỉ lệ** $\hat{p} = X/n$ (số thành công chia số thử). Với $X \sim \operatorname{Bin}(n, p)$ (Phần 2), ta có $E[\hat{p}] = p$ và $\operatorname{Var}(\hat{p}) = p(1-p)/n$. Khi n đủ lớn (quy tắc thực hành: $np \ge 10$ và $n(1-p) \ge 10$), $\hat{p}$ xấp xỉ chuẩn — đây là bản CLT rời rạc, phát hiện đầu tiên trong lịch sử bởi de Moivre năm 1738 [^5].
- **Hiệu hai trung bình** $\bar{X}_1 - \bar{X}_2$ với hai mẫu độc lập: $E = \mu_1 - \mu_2$ và $\operatorname{Var} = \sigma_1^2/n_1 + \sigma_2^2/n_2$ — chính là mẫu số của thống kê t hai mẫu và Welch ở Phần 1, giờ đã có nguồn gốc rõ ràng.

```example[Sai số chuẩn của tỉ lệ giếng mọc]
Nuôi cấy n = 50 giếng, xác suất mọc p = 0,3. Ước lượng $\hat{p}$ có $E = 0{,}3$ và
$$\operatorname{SD}(\hat{p}) = \sqrt{\frac{0{,}3 \times 0{,}7}{50}} = \sqrt{0{,}0042} \approx 0{,}065.$$
Báo cáo "tỉ lệ mọc ≈ 0,30 ± 0,065 (SE)" — khoảng ±2 SE (≈ 0,13) là vùng tin cậy xấp xỉ 95% nhờ CLT.
```

```example[Sai số chuẩn của hiệu hai trung bình]
So sánh hai lô chuột: lô đối chứng n₁ = 8, s₁ = 3,5 mg/dL; lô điều trị n₂ = 8, s₂ = 4,2 mg/dL. Hiệu trung bình $\bar{x}_1 - \bar{x}_2$ có sai số chuẩn
$$SE = \sqrt{\frac{3{,}5^2}{8} + \frac{4{,}2^2}{8}} = \sqrt{1{,}53 + 2{,}21} = \sqrt{3{,}74} = 1{,}93.$$
Quy tắc 2 SE: nếu $|\bar{x}_1 - \bar{x}_2|$ vượt khoảng $2 \times 1{,}93 \approx 3{,}9$ mg/dL thì hiệu khó là ngẫu nhiên — chính là trực giác đằng sau thống kê t hai mẫu ở Phần 1 (ở đó hệ số 2 được thay bằng giá trị $t$ chính xác theo bậc tự do).
```

## Phần B — Định lý giới hạn trung tâm

### Phát biểu đầy đủ

Phần 1 đã giới thiệu CLT; giờ ta phát biểu đầy đủ và chính xác, vì nó là trái tim của toàn bộ phần này:

```theorem[Định lý giới hạn trung tâm (CLT)]
Cho $X_1, X_2, \dots$ độc lập, cùng phân phối với kỳ vọng $\mu$ và phương sai hữu hạn $\sigma^2$. Khi $n \to \infty$:
$$\frac{\bar{X} - \mu}{\sigma/\sqrt{n}} \xrightarrow{d} \mathcal{N}(0,1).$$
```

Ký hiệu $\xrightarrow{d}$ nghĩa là hội tụ theo phân phối: hàm phân phối của vế trái tiến về hàm phân phối chuẩn tắc tại mọi điểm liên tục. Diễn giải bằng lời: **chuẩn hoá trung bình mẫu bằng cách trừ $\mu$ và chia cho sai số chuẩn, ta được một đại lượng có phân phối xấp xỉ chuẩn tắc khi n đủ lớn — bất kể phân phối gốc là gì.** Không cần biết hình dạng quần thể; chỉ cần nó có phương sai hữu hạn.

### Vì sao nó đúng

Trực giác sâu nhất: **tổng nhiều hiệu ứng nhỏ độc lập làm trơn mọi "gồ ghề" của phân phối gốc.** Về mặt toán học, phân phối của tổng là tích chập (convolution) của các phân phối thành phần; tích chập lặp đi lặp lại xoá dần các chi tiết và chỉ giữ lại hai đặc trưng bậc thấp — trung bình và phương sai. Phân phối chuẩn là "điểm hút" duy nhất của quá trình này: bất kỳ tổng nào hội tụ (sau chuẩn hoá) đều hội tụ về chuẩn.

Có thể thấy cơ chế qua các moment: độ lệch (skewness) của tổng n biến giảm như $1/\sqrt{n}$, độ nhọn (kurtosis) giảm như $1/n$ — "sự không chuẩn" của tổng bị pha loãng nhanh. Đây cũng là lý do sai số đo lường trông như chuẩn (Gauss): một phép đo là tổng của nhiều nguồn nhiễu nhỏ độc lập, nên tổng của chúng thành chuông dù từng nguồn nhiễu có phân phối gì.

Định lý còn cho một chặn định lượng về tốc độ hội tụ — kết quả của Berry và Esseen [^1]:

```remark[Chặn Berry–Esseen: CLT hội tụ nhanh cỡ nào]
Ký hiệu $F_n$ là phân phối của chuẩn hoá $\frac{\bar{X}-\mu}{\sigma/\sqrt{n}}$ và $\Phi$ là phân phối chuẩn tắc. Berry–Esseen cho biết
$$|F_n(x) - \Phi(x)| \le \frac{C\,\rho}{\sigma^3\sqrt{n}} \quad \text{với mọi } x,$$
trong đó $\rho = E[|X - \mu|^3]$ là moment tuyệt đối bậc ba — đại lượng đo "mức độ lệch + đuôi nặng" của phân phối gốc — và $C$ là hằng số phổ dụng, chặn trên tốt nhất hiện nay là $C \le 0{,}48$ (Shevtsova, 2011) và không thể hạ dưới $\approx 0{,}41$. Hai bài học: (1) sai số của xấp xỉ chuẩn giảm như $1/\sqrt{n}$ — gấp 4 lần n, sai số giảm một nửa; (2) tử số $\rho/\sigma^3$ giải thích vì sao phân phối gốc càng lệch/càng đuôi nặng thì càng cần n lớn.
```

```example[Định lượng "càng lệch càng cần n lớn"]
Với phân phối mũ $X \sim \operatorname{Exp}(1)$ (rất lệch, đuôi dài): $\mu = \sigma = 1$ và $\rho = E[|X-1|^3] = 12/e - 2 = 2{,}41$. Chặn Berry–Esseen trở thành:
$$|F_n - \Phi| \le \frac{0{,}48 \times 2{,}41}{\sqrt{n}} \approx \frac{1{,}16}{\sqrt{n}} \quad\Rightarrow\quad n = 30{:}\ 0{,}21;\quad n = 100{:}\ 0{,}12;\quad n = 1000{:}\ 0{,}037.$$
So sánh với phân phối đều $U(0,1)$ (đối xứng, nhẹ đuôi): $\rho/\sigma^3 = 1{,}30$, chặn chỉ $\approx 0{,}62/\sqrt{n}$ — cùng một n, sai số xấp xỉ chuẩn nhỏ hơn gần một nửa. Bài học thực hành: với dữ liệu thời gian phản ứng hay nồng độ (lệch phải), đừng tin "n = 30 là đủ" — cần n lớn hơn, hoặc dùng phương pháp phi tham số.
```

```remark[Điều CLT không nói]
CLT không làm dữ liệu gốc thành chuẩn — nó chỉ nói về trung bình mẫu (hoặc tổng chuẩn hoá). Với n nhỏ và phân phối gốc lệch nặng, trung bình mẫu vẫn chưa chuẩn, và mọi suy luận dựa trên xấp xỉ chuẩn sẽ sai. "n ≥ 30" chỉ là quy tắc ngón tay cái cho phân phối gốc không quá xấu; với dữ liệu lệch mạnh (nồng độ, thời gian phản ứng) hay đuôi nặng, cần n lớn hơn nhiều — hoặc dùng phương pháp bền vững, kiểm định phi tham số.
```

<figure style="margin:1.8em 0;"><img src="/img/stats/clt-demo.svg" alt="Minh hoạ CLT" style="display:block;width:100%;max-width:620px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Hình 3 — Mô phỏng 4000 mẫu từ một phân phối mũ lệch mạnh (góc trên trái). Histogram của trung bình mẫu với n = 2 vẫn lệch; n = 10 đã gần chuông; n = 30 hầu như chuẩn — đường cong vàng là dự đoán N(μ, σ²/n) của CLT, không cần biết gì về phân phối gốc.</figcaption></figure>

## Phần C — Vì sao có thể suy luận từ mẫu

### Trục xoay: đại lượng có phân phối biết trước

Phân phối mẫu của $\bar{X}$ phụ thuộc vào $\sigma$ — thứ ta không biết. Vậy làm thế nào dùng nó để suy luận? Câu trả lời: thay $\sigma$ bằng $s$ và dùng một **trục xoay (pivot)** — đại lượng vừa chứa $\mu$ (thứ ta muốn suy luận) vừa có phân phối *không phụ thuộc vào bất kỳ tham số chưa biết nào*:

```definition[Trục xoay t]
Với dữ liệu chuẩn, thống kê
$$T = \frac{\bar{X} - \mu}{s/\sqrt{n}}$$
có **phân phối $t$ với $n-1$ bậc tự do** — không phụ thuộc vào $\mu$ hay $\sigma$.
```

Kết quả này do Gosset công bố năm 1908 dưới bút danh "Student" [^2].

So sánh với $Z = \frac{\bar{X}-\mu}{\sigma/\sqrt{n}}$: nếu biết $\sigma$, $Z$ chuẩn tắc chính xác. Khi thay $\sigma$ bằng $s$, mẫu số trở thành biến ngẫu nhiên — đôi khi nhỏ hơn $\sigma$ (làm $T$ phóng đại), đôi khi lớn hơn — nên phân phối của $T$ loãng hơn, đuôi dày hơn chuẩn tắc. Đó chính là nội dung hình học của việc dùng $t$ thay vì $z$: "giá trị tới hạn phải xa hơn" khi mẫu nhỏ, vì $s$ kém chắc chắn.

<figure style="margin:1.8em 0;"><img src="/img/stats/t-families.svg" alt="Họ phân phối t" style="display:block;width:100%;max-width:620px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Hình 4 — Phân phối của T = (x̄ − μ)/(s/√n) với n = 3, 6, 30 và chuẩn tắc. n càng nhỏ, s càng bất định, đuôi càng dày — "phải đi xa hơn" mới bác bỏ H₀. Khi n lớn, s ≈ σ và t ≈ chuẩn tắc.</figcaption></figure>

### Chuỗi suy luận hoàn chỉnh

Giờ ghép toàn bộ loạt bài thành một mạch duy nhất — câu trả lời cho "vì sao có thể suy luận từ mẫu":

1. **Mẫu** → ta tính thống kê $\bar{x}$, $s$ (Phần 1).
2. Thống kê là biến ngẫu nhiên có **phân phối mẫu** với tâm và độ phân tán biết trước: $E[\bar{X}] = \mu$, $\operatorname{SD} = \sigma/\sqrt{n}$ (phần A).
3. Khi $\sigma$ chưa biết, dùng **trục xoay** $T$ có phân phối $t_{n-1}$ — không còn tham số lạ nào (phần C).
4. Vì phân phối của $T$ biết trước, ta tính được xác suất: khoảng tin cậy (tìm $t_{\alpha/2}$ sao cho $P(|T| \le t_{\alpha/2}) = 1-\alpha$) và p-value (xác suất $T$ cực đoan hơn quan sát) — chính là máy suy luận của Phần 1.

Bước 3 là bước quyết định: **ta không cần biết $\mu$ hay $\sigma$ để biết $T$ phân phối thế nào.** Đó là lý do một con số duy nhất từ mẫu có thể "nói" về một quần thể vô hạn: nó được đặt trong một khuôn phân phối đã biết từ trước, và mọi sự không chắc chắn còn lại đều đo đếm được bằng xác suất.

### Sai số chuẩn và thiết kế thí nghiệm

<figure style="margin:1.8em 0;"><img src="/img/stats/se-vs-n.svg" alt="Sai số chuẩn giảm theo căn bậc hai của n" style="display:block;width:100%;max-width:620px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Hình 5 — SE = σ/√n giảm nhanh lúc đầu rồi chững lại: từ n = 1 lên 4, SE giảm một nửa; từ 4 lên 16 lại giảm một nửa; nhưng từ 16 lên 64 cũng chỉ giảm một nửa nữa. Đây là đòn bẩy toán học đằng sau tính toán cỡ mẫu ở Phần 1.</figcaption></figure>

```example[Tổng hợp: khoảng tin cậy với nhiều lần lặp hơn]
Đo IC50, n = 9 lần lặp độc lập: $\bar{x} = 12{,}4$ µM, $s = 2{,}1$ µM. Sai số chuẩn $\mathrm{SE} = 2{,}1/\sqrt{9} = 0{,}7$. Với 8 bậc tự do, $t_{0{,}025,8} = 2{,}306$, khoảng tin cậy 95%:
$$12{,}4 \pm 2{,}306 \times 0{,}7 = 12{,}4 \pm 1{,}6, \quad \text{tức } [10{,}8;\; 14{,}0]\ \text{µM}.$$
So với Phần 1 (cùng số liệu, n = 6 cho $[10{,}2;\; 14{,}6]$): thêm 3 lần lặp đã thu hẹp khoảng từ 4,4 xuống 3,2 µM — đúng như Hình 5: tăng n từ 6 lên 9 giảm SE theo √(6/9) ≈ 0,82.
```

```remark[Bootstrap: khi phân phối mẫu không biết trước]
Toàn bộ phần này dựa vào việc biết phân phối mẫu (chuẩn, t, χ²). Khi thống kê phức tạp (trung vị, tỉ số, hệ số hồi quy) mà phân phối mẫu không có công thức, **bootstrap** cho phép xấp xỉ nó bằng chính dữ liệu: rút mẫu lại từ dữ liệu (có hoàn lại) hàng nghìn lần, tính thống kê mỗi lần, và dùng phân phối của các giá trị đó làm xấp xỉ phân phối mẫu. Khái niệm cốt lõi vẫn y nguyên: mọi suy luận đều là câu hỏi "thống kê này phân tán thế nào trên các mẫu có thể có".
```

Phương pháp này do Efron đề xuất năm 1979 [^4] và từ đó trở thành công cụ chuẩn cho những thống kê không có phân phối mẫu dạng đóng.

### Lưu ý thực hành

1. **Giả định độc lập là nền tảng.** Công thức $\operatorname{Var}(\bar{X}) = \sigma^2/n$ sụp đổ hoàn toàn nếu các quan sát tương quan: đo sáu giếng cùng một dung dịch mẹ không phải sáu thông tin độc lập, và "n hiệu quả" thực tế nhỏ hơn nhiều so với số giếng. Phân phối mẫu chỉ đúng với n thực sự độc lập.
2. **Phân phối mẫu nói về thống kê, không nói về dữ liệu.** Một histogram của 30 phép đo IC50 có thể rất không chuẩn trong khi $\bar{x}$ của chúng vẫn gần chuẩn — đừng lấy histogram dữ liệu để phán xét tính hợp lệ của khoảng tin cậy.
3. **CLT không phải thẻ thoát hiểm.** Với n nhỏ và dữ liệu lệch/đuôi nặng, đừng dựa vào xấp xỉ chuẩn; dùng kiểm định phi tham số hoặc bootstrap.
4. **Báo cáo cả SE và n.** "12,4 ± 0,7 (SE, n = 9)" cho người đọc biết cả độ chính xác lẫn mức tin cậy — và cho phép họ tái tính khoảng tin cậy khi cần.

### Lộ trình tiếp theo

Ba phần đã đủ để trả lời câu hỏi trung tâm: mẫu → thống kê → phân phối mẫu biết trước → xác suất có thể tính → suy luận. Các phần tiếp theo sẽ khai thác cùng khung này cho những tình huống cụ thể: (1) lan truyền sai số — khi $Y = g(X_1, \dots, X_k)$, phương sai của $Y$ được tính từ các phương sai thành phần thế nào (hệ quả trực tiếp của $\operatorname{Var}$ và xấp xỉ tuyến tính); (2) các giả định của hồi quy dưới ánh sáng mô hình $X = \mu + \varepsilon$ — mỗi hệ số hồi quy có phân phối mẫu riêng, và kiểm định về nó dùng chính trục xoay t; (3) các phân phối chuẩn, t, χ², F gặp nhau thế nào trong ANOVA. Khung "phân phối mẫu + trục xoay" của bài này là chìa khoá mở cả ba.

[^1]: Andrew C. Berry, "The accuracy of the Gaussian approximation to the sum of independent variates," *Transactions of the American Mathematical Society* 49(1): 122–136, 1941; Carl-Gustav Esseen, "On the Liapounoff limit of error in the theory of probability," *Arkiv för Matematik, Astronomi och Fysik* 28A(9): 1–19, 1942.
[^2]: Student, "The probable error of a mean," *Biometrika* 6(1): 1–25, 1908.
[^3]: Friedrich Robert Helmert, "Die Genauigkeit der Formel von Peters zur Berechnung des wahrscheinlichen Beobachtungsfehlers direkter Beobachtungen gleicher Genauigkeit," *Astronomische Nachrichten* 88: 113–132, 1876.
[^4]: Bradley Efron, "Bootstrap methods: another look at the jackknife," *Annals of Statistics* 7(1): 1–26, 1979.
[^5]: Abraham de Moivre, *The Doctrine of Chances*, 2nd ed., London, 1738.
