#include <iostream>
#include <vector>
#include <bits/stdc++.h>
using namespace std;
void factorialN(int n, vector<int> &numbers)
{
    for (int i = 1; i <= n; i++)
    {
        numbers[i] = i * numbers[i - 1];
    }
}
int main()
{
    string s = "1001";
    string t = "1101";

    char c = ((s[1] - '0') ^ (t[1] - '0')) + '0';
    
    cout<<c<<endl;

    cout<<t[2]-'0'<<endl;

    cout<<s<<endl;
    return 0;
}
