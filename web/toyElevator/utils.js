/**
Assert that a condition holds true
*/
function assert(condition, errorText)
{
    if (!condition)
    {
        error(errorText);
    }
}

/**
Abort execution because a critical error occurred
*/
function error(errorText)
{
    alert('ERROR: ' + errorText);

    throw errorText;
}


