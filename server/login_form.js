module.exports = (message) => `
<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <link rel="shortcut icon" href="./static/medvebet.ico" type="image/x-icon">
    <title>LOGIN</title>
    <style>
        form {
            width: 400px;
            margin-left: auto;
            margin-right: auto;

            display: flex;
            flex-direction: column;
            justify-content: center;
        }

        input {
            padding-left: 8px;
            box-sizing: border-box;
            font-size: 24px;
            width: 400px;
            height: 60px;
        }

        .error-message {
            color: red;
            background: rgb(239, 239, 239);
            width: 400px;
            text-align: center;
            font-size: 24px;
            border: 1px solid black;
            box-sizing: border-box;
        }
    </style>
</head>

<body>
    <form action="/login" method="post">
        <img src="../static/medvebet.png" />
        <div>
            <input placeholder="username" type="text" name="username" autocomplete="username" />
        </div>
        <div>
            <input placeholder="password" type="password" name="password" autocomplete="current-password" />
        </div>
        <div>
            <input type="submit" value="Log In" />
        </div>
        ${message ? `<div class="error-message">${message}</div>` : ""}
    </form>
    <script type="text/javascript">
    const primes = Array(10000).fill(1);
    primes[0] = 0;
    primes[1] = 0;
    
    let i = 2;
    while (i < primes.length) {
        if (primes[i]) {
            for (let j=i*i; j<primes.length; j+=i) {
                primes[j] = 0;
            }
        }
        i++;
    }
    
    const isPrime = n => primes[n];
    const getFN = fn => (x, y) => isPrime(fn(x, y));
    
    const fn2 = getFN((x, y) => x|y);
    
    const canvas = document.createElement("canvas");
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    canvas.style.position = "absolute";
    canvas.style.top = 0;
    canvas.style.left = 0;
    canvas.style.zIndex = -1;

    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    const imageData = ctx.getImageData(0, 0, w, h);
    
    i=0;
    while (i<imageData.data.length) {
        const y = ~~(i / 4 / w);
        const x = (i / 4) % w;
        if (fn2(x, y)) {
            imageData.data[i] = 0;
            imageData.data[i+1] = 255;
            imageData.data[i+2] = 255;
            imageData.data[i+3] = 255;
        }
    
        i += 4;
    }
    
    ctx.putImageData(imageData, 0, 0);
    </script>
</body>

</html>
`;